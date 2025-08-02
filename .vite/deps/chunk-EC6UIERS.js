import {
  require_react_dom
} from "./chunk-PV7ZWGTI.js";
import {
  ConfigContext,
  DesignTokenContext,
  FastColor,
  Keyframes_default,
  SizeContextProvider,
  SizeContext_default,
  StyleContext_default,
  Variants,
  WarningContext,
  _assertThisInitialized,
  _classCallCheck,
  _createClass,
  _createSuper,
  _extends,
  _getPrototypeOf,
  _inherits,
  _isNativeReflectConstruct,
  _objectWithoutProperties,
  _setPrototypeOf,
  _slicedToArray,
  _toConsumableArray,
  blue,
  canUseDom,
  clearFix,
  composeRef,
  createTheme,
  defaultConfig,
  defaultIconPrefixCls,
  defaultPrefixCls,
  devUseWarning,
  fillRef,
  genFocusOutline,
  genFocusStyle,
  genStyleHooks,
  generate,
  get,
  getNodeRef,
  isEqual_default,
  isFragment,
  merge,
  merge2,
  removeCSS,
  resetComponent,
  seed_default,
  set,
  supportRef,
  textEllipsis,
  theme_default,
  unit,
  updateCSS,
  useComponentConfig,
  useComposeRef,
  useEvent,
  useLayoutEffect_default,
  useLayoutUpdateEffect,
  useMemo,
  useMergedState,
  useResetIconStyle_default,
  useSafeState,
  useSize_default,
  useToken,
  warning,
  warning_default,
  warning_default2
} from "./chunk-GGF5EFL3.js";
import {
  commonLocale
} from "./chunk-N77XPGZE.js";
import {
  _defineProperty,
  _objectSpread2,
  _typeof
} from "./chunk-IJSSJBZ4.js";
import {
  CloseOutlined_default,
  EllipsisOutlined_default,
  PlusOutlined_default
} from "./chunk-DGJ4EUQL.js";
import {
  require_classnames
} from "./chunk-KUJFIW67.js";
import {
  require_react
} from "./chunk-2CLD7BNN.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/antd/es/card/Card.js
var React108 = __toESM(require_react());
var import_classnames35 = __toESM(require_classnames());

// node_modules/rc-util/es/omit.js
function omit(obj, fields) {
  var clone = Object.assign({}, obj);
  if (Array.isArray(fields)) {
    fields.forEach(function(key) {
      delete clone[key];
    });
  }
  return clone;
}

// node_modules/antd/es/config-provider/index.js
var React17 = __toESM(require_react());

// node_modules/antd/node_modules/@ant-design/icons/es/components/Context.js
var import_react = __toESM(require_react());
var IconContext = (0, import_react.createContext)({});
var Context_default = IconContext;

// node_modules/antd/es/form/validateMessagesContext.js
var import_react2 = __toESM(require_react());
var validateMessagesContext_default = (0, import_react2.createContext)(void 0);

// node_modules/antd/es/locale/index.js
var React2 = __toESM(require_react());

// node_modules/rc-pagination/es/locale/en_US.js
var locale = {
  // Options
  items_per_page: "/ page",
  jump_to: "Go to",
  jump_to_confirm: "confirm",
  page: "Page",
  // Pagination
  prev_page: "Previous Page",
  next_page: "Next Page",
  prev_5: "Previous 5 Pages",
  next_5: "Next 5 Pages",
  prev_3: "Previous 3 Pages",
  next_3: "Next 3 Pages",
  page_size: "Page Size"
};
var en_US_default = locale;

// node_modules/rc-picker/es/locale/en_US.js
var locale2 = _objectSpread2(_objectSpread2({}, commonLocale), {}, {
  locale: "en_US",
  today: "Today",
  now: "Now",
  backToToday: "Back to today",
  ok: "OK",
  clear: "Clear",
  week: "Week",
  month: "Month",
  year: "Year",
  timeSelect: "select time",
  dateSelect: "select date",
  weekSelect: "Choose a week",
  monthSelect: "Choose a month",
  yearSelect: "Choose a year",
  decadeSelect: "Choose a decade",
  dateFormat: "M/D/YYYY",
  dateTimeFormat: "M/D/YYYY HH:mm:ss",
  previousMonth: "Previous month (PageUp)",
  nextMonth: "Next month (PageDown)",
  previousYear: "Last year (Control + left)",
  nextYear: "Next year (Control + right)",
  previousDecade: "Last decade",
  nextDecade: "Next decade",
  previousCentury: "Last century",
  nextCentury: "Next century"
});
var en_US_default2 = locale2;

// node_modules/antd/es/time-picker/locale/en_US.js
var locale3 = {
  placeholder: "Select time",
  rangePlaceholder: ["Start time", "End time"]
};
var en_US_default3 = locale3;

// node_modules/antd/es/date-picker/locale/en_US.js
var locale4 = {
  lang: Object.assign({
    placeholder: "Select date",
    yearPlaceholder: "Select year",
    quarterPlaceholder: "Select quarter",
    monthPlaceholder: "Select month",
    weekPlaceholder: "Select week",
    rangePlaceholder: ["Start date", "End date"],
    rangeYearPlaceholder: ["Start year", "End year"],
    rangeQuarterPlaceholder: ["Start quarter", "End quarter"],
    rangeMonthPlaceholder: ["Start month", "End month"],
    rangeWeekPlaceholder: ["Start week", "End week"]
  }, en_US_default2),
  timePickerLocale: Object.assign({}, en_US_default3)
};
var en_US_default4 = locale4;

// node_modules/antd/es/calendar/locale/en_US.js
var en_US_default5 = en_US_default4;

// node_modules/antd/es/locale/en_US.js
var typeTemplate = "${label} is not a valid ${type}";
var localeValues = {
  locale: "en",
  Pagination: en_US_default,
  DatePicker: en_US_default4,
  TimePicker: en_US_default3,
  Calendar: en_US_default5,
  global: {
    placeholder: "Please select",
    close: "Close"
  },
  Table: {
    filterTitle: "Filter menu",
    filterConfirm: "OK",
    filterReset: "Reset",
    filterEmptyText: "No filters",
    filterCheckAll: "Select all items",
    filterSearchPlaceholder: "Search in filters",
    emptyText: "No data",
    selectAll: "Select current page",
    selectInvert: "Invert current page",
    selectNone: "Clear all data",
    selectionAll: "Select all data",
    sortTitle: "Sort",
    expand: "Expand row",
    collapse: "Collapse row",
    triggerDesc: "Click to sort descending",
    triggerAsc: "Click to sort ascending",
    cancelSort: "Click to cancel sorting"
  },
  Tour: {
    Next: "Next",
    Previous: "Previous",
    Finish: "Finish"
  },
  Modal: {
    okText: "OK",
    cancelText: "Cancel",
    justOkText: "OK"
  },
  Popconfirm: {
    okText: "OK",
    cancelText: "Cancel"
  },
  Transfer: {
    titles: ["", ""],
    searchPlaceholder: "Search here",
    itemUnit: "item",
    itemsUnit: "items",
    remove: "Remove",
    selectCurrent: "Select current page",
    removeCurrent: "Remove current page",
    selectAll: "Select all data",
    deselectAll: "Deselect all data",
    removeAll: "Remove all data",
    selectInvert: "Invert current page"
  },
  Upload: {
    uploading: "Uploading...",
    removeFile: "Remove file",
    uploadError: "Upload error",
    previewFile: "Preview file",
    downloadFile: "Download file"
  },
  Empty: {
    description: "No data"
  },
  Icon: {
    icon: "icon"
  },
  Text: {
    edit: "Edit",
    copy: "Copy",
    copied: "Copied",
    expand: "Expand",
    collapse: "Collapse"
  },
  Form: {
    optional: "(optional)",
    defaultValidateMessages: {
      default: "Field validation error for ${label}",
      required: "Please enter ${label}",
      enum: "${label} must be one of [${enum}]",
      whitespace: "${label} cannot be a blank character",
      date: {
        format: "${label} date format is invalid",
        parse: "${label} cannot be converted to a date",
        invalid: "${label} is an invalid date"
      },
      types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: typeTemplate,
        date: typeTemplate,
        boolean: typeTemplate,
        integer: typeTemplate,
        float: typeTemplate,
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate
      },
      string: {
        len: "${label} must be ${len} characters",
        min: "${label} must be at least ${min} characters",
        max: "${label} must be up to ${max} characters",
        range: "${label} must be between ${min}-${max} characters"
      },
      number: {
        len: "${label} must be equal to ${len}",
        min: "${label} must be minimum ${min}",
        max: "${label} must be maximum ${max}",
        range: "${label} must be between ${min}-${max}"
      },
      array: {
        len: "Must be ${len} ${label}",
        min: "At least ${min} ${label}",
        max: "At most ${max} ${label}",
        range: "The amount of ${label} must be between ${min}-${max}"
      },
      pattern: {
        mismatch: "${label} does not match the pattern ${pattern}"
      }
    }
  },
  Image: {
    preview: "Preview"
  },
  QRCode: {
    expired: "QR code expired",
    refresh: "Refresh",
    scanned: "Scanned"
  },
  ColorPicker: {
    presetEmpty: "Empty",
    transparent: "Transparent",
    singleColor: "Single",
    gradientColor: "Gradient"
  }
};
var en_US_default6 = localeValues;

// node_modules/antd/es/modal/locale.js
var runtimeLocale = Object.assign({}, en_US_default6.Modal);
var localeList = [];
var generateLocale = () => localeList.reduce((merged, locale5) => Object.assign(Object.assign({}, merged), locale5), en_US_default6.Modal);
function changeConfirmLocale(newLocale) {
  if (newLocale) {
    const cloneLocale = Object.assign({}, newLocale);
    localeList.push(cloneLocale);
    runtimeLocale = generateLocale();
    return () => {
      localeList = localeList.filter((locale5) => locale5 !== cloneLocale);
      runtimeLocale = generateLocale();
    };
  }
  runtimeLocale = Object.assign({}, en_US_default6.Modal);
}
function getConfirmLocale() {
  return runtimeLocale;
}

// node_modules/antd/es/locale/context.js
var import_react3 = __toESM(require_react());
var LocaleContext = (0, import_react3.createContext)(void 0);
var context_default = LocaleContext;

// node_modules/antd/es/locale/useLocale.js
var React = __toESM(require_react());
var useLocale = (componentName, defaultLocale) => {
  const fullLocale = React.useContext(context_default);
  const getLocale = React.useMemo(() => {
    var _a;
    const locale5 = defaultLocale || en_US_default6[componentName];
    const localeFromContext = (_a = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale[componentName]) !== null && _a !== void 0 ? _a : {};
    return Object.assign(Object.assign({}, typeof locale5 === "function" ? locale5() : locale5), localeFromContext || {});
  }, [componentName, defaultLocale, fullLocale]);
  const getLocaleCode = React.useMemo(() => {
    const localeCode = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.locale;
    if ((fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.exist) && !localeCode) {
      return en_US_default6.locale;
    }
    return localeCode;
  }, [fullLocale]);
  return [getLocale, getLocaleCode];
};
var useLocale_default = useLocale;

// node_modules/antd/es/locale/index.js
var ANT_MARK = "internalMark";
var LocaleProvider = (props) => {
  const {
    locale: locale5 = {},
    children,
    _ANT_MARK__
  } = props;
  if (true) {
    const warning5 = devUseWarning("LocaleProvider");
    true ? warning5(_ANT_MARK__ === ANT_MARK, "deprecated", "`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale") : void 0;
  }
  React2.useEffect(() => {
    const clearLocale = changeConfirmLocale(locale5 === null || locale5 === void 0 ? void 0 : locale5.Modal);
    return clearLocale;
  }, [locale5]);
  const getMemoizedContextValue = React2.useMemo(() => Object.assign(Object.assign({}, locale5), {
    exist: true
  }), [locale5]);
  return React2.createElement(context_default.Provider, {
    value: getMemoizedContextValue
  }, children);
};
if (true) {
  LocaleProvider.displayName = "LocaleProvider";
}
var locale_default = LocaleProvider;

// node_modules/antd/es/config-provider/cssVariables.js
var dynamicStyleMark = `-ant-${Date.now()}-${Math.random()}`;
function getStyle(globalPrefixCls2, theme) {
  const variables = {};
  const formatColor = (color, updater) => {
    let clone = color.clone();
    clone = (updater === null || updater === void 0 ? void 0 : updater(clone)) || clone;
    return clone.toRgbString();
  };
  const fillColor = (colorVal, type5) => {
    const baseColor = new FastColor(colorVal);
    const colorPalettes = generate(baseColor.toRgbString());
    variables[`${type5}-color`] = formatColor(baseColor);
    variables[`${type5}-color-disabled`] = colorPalettes[1];
    variables[`${type5}-color-hover`] = colorPalettes[4];
    variables[`${type5}-color-active`] = colorPalettes[6];
    variables[`${type5}-color-outline`] = baseColor.clone().setA(0.2).toRgbString();
    variables[`${type5}-color-deprecated-bg`] = colorPalettes[0];
    variables[`${type5}-color-deprecated-border`] = colorPalettes[2];
  };
  if (theme.primaryColor) {
    fillColor(theme.primaryColor, "primary");
    const primaryColor = new FastColor(theme.primaryColor);
    const primaryColors = generate(primaryColor.toRgbString());
    primaryColors.forEach((color, index2) => {
      variables[`primary-${index2 + 1}`] = color;
    });
    variables["primary-color-deprecated-l-35"] = formatColor(primaryColor, (c) => c.lighten(35));
    variables["primary-color-deprecated-l-20"] = formatColor(primaryColor, (c) => c.lighten(20));
    variables["primary-color-deprecated-t-20"] = formatColor(primaryColor, (c) => c.tint(20));
    variables["primary-color-deprecated-t-50"] = formatColor(primaryColor, (c) => c.tint(50));
    variables["primary-color-deprecated-f-12"] = formatColor(primaryColor, (c) => c.setA(c.a * 0.12));
    const primaryActiveColor = new FastColor(primaryColors[0]);
    variables["primary-color-active-deprecated-f-30"] = formatColor(primaryActiveColor, (c) => c.setA(c.a * 0.3));
    variables["primary-color-active-deprecated-d-02"] = formatColor(primaryActiveColor, (c) => c.darken(2));
  }
  if (theme.successColor) {
    fillColor(theme.successColor, "success");
  }
  if (theme.warningColor) {
    fillColor(theme.warningColor, "warning");
  }
  if (theme.errorColor) {
    fillColor(theme.errorColor, "error");
  }
  if (theme.infoColor) {
    fillColor(theme.infoColor, "info");
  }
  const cssList = Object.keys(variables).map((key) => `--${globalPrefixCls2}-${key}: ${variables[key]};`);
  return `
  :root {
    ${cssList.join("\n")}
  }
  `.trim();
}
function registerTheme(globalPrefixCls2, theme) {
  const style2 = getStyle(globalPrefixCls2, theme);
  if (canUseDom()) {
    updateCSS(style2, `${dynamicStyleMark}-dynamic-theme`);
  } else {
    true ? warning_default2(false, "ConfigProvider", "SSR do not support dynamic theme with css variables.") : void 0;
  }
}

// node_modules/antd/es/config-provider/DisabledContext.js
var React3 = __toESM(require_react());
var DisabledContext = React3.createContext(false);
var DisabledContextProvider = ({
  children,
  disabled
}) => {
  const originDisabled = React3.useContext(DisabledContext);
  return React3.createElement(DisabledContext.Provider, {
    value: disabled !== null && disabled !== void 0 ? disabled : originDisabled
  }, children);
};
var DisabledContext_default = DisabledContext;

// node_modules/antd/es/config-provider/hooks/useConfig.js
var import_react4 = __toESM(require_react());
function useConfig() {
  const componentDisabled = (0, import_react4.useContext)(DisabledContext_default);
  const componentSize = (0, import_react4.useContext)(SizeContext_default);
  return {
    componentDisabled,
    componentSize
  };
}
var useConfig_default = useConfig;

// node_modules/antd/es/config-provider/hooks/useThemeKey.js
var React4 = __toESM(require_react());
var fullClone = Object.assign({}, React4);
var {
  useId
} = fullClone;
var useEmptyId = () => "";
var useThemeKey = typeof useId === "undefined" ? useEmptyId : useId;
var useThemeKey_default = useThemeKey;

// node_modules/antd/es/config-provider/hooks/useTheme.js
function useTheme(theme, parentTheme, config) {
  var _a, _b;
  const warning5 = devUseWarning("ConfigProvider");
  const themeConfig = theme || {};
  const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? Object.assign(Object.assign({}, defaultConfig), {
    hashed: (_a = parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.hashed) !== null && _a !== void 0 ? _a : defaultConfig.hashed,
    cssVar: parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.cssVar
  }) : parentTheme;
  const themeKey = useThemeKey_default();
  if (true) {
    const cssVarEnabled = themeConfig.cssVar || parentThemeConfig.cssVar;
    const validKey = !!(typeof themeConfig.cssVar === "object" && ((_b = themeConfig.cssVar) === null || _b === void 0 ? void 0 : _b.key) || themeKey);
    true ? warning5(!cssVarEnabled || validKey, "breaking", "Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.") : void 0;
  }
  return useMemo(() => {
    var _a2, _b2;
    if (!theme) {
      return parentTheme;
    }
    const mergedComponents = Object.assign({}, parentThemeConfig.components);
    Object.keys(theme.components || {}).forEach((componentName) => {
      mergedComponents[componentName] = Object.assign(Object.assign({}, mergedComponents[componentName]), theme.components[componentName]);
    });
    const cssVarKey = `css-var-${themeKey.replace(/:/g, "")}`;
    const mergedCssVar = ((_a2 = themeConfig.cssVar) !== null && _a2 !== void 0 ? _a2 : parentThemeConfig.cssVar) && Object.assign(Object.assign(Object.assign({
      prefix: config === null || config === void 0 ? void 0 : config.prefixCls
    }, typeof parentThemeConfig.cssVar === "object" ? parentThemeConfig.cssVar : {}), typeof themeConfig.cssVar === "object" ? themeConfig.cssVar : {}), {
      key: typeof themeConfig.cssVar === "object" && ((_b2 = themeConfig.cssVar) === null || _b2 === void 0 ? void 0 : _b2.key) || cssVarKey
    });
    return Object.assign(Object.assign(Object.assign({}, parentThemeConfig), themeConfig), {
      token: Object.assign(Object.assign({}, parentThemeConfig.token), themeConfig.token),
      components: mergedComponents,
      cssVar: mergedCssVar
    });
  }, [themeConfig, parentThemeConfig], (prev, next) => prev.some((prevTheme, index2) => {
    const nextTheme = next[index2];
    return !isEqual_default(prevTheme, nextTheme, true);
  }));
}

// node_modules/antd/es/config-provider/MotionWrapper.js
var React15 = __toESM(require_react());

// node_modules/rc-motion/es/CSSMotion.js
var import_classnames = __toESM(require_classnames());

// node_modules/rc-util/es/Dom/findDOMNode.js
var import_react5 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
function isDOM(node) {
  return node instanceof HTMLElement || node instanceof SVGElement;
}
function getDOM(node) {
  if (node && _typeof(node) === "object" && isDOM(node.nativeElement)) {
    return node.nativeElement;
  }
  if (isDOM(node)) {
    return node;
  }
  return null;
}
function findDOMNode(node) {
  var domNode = getDOM(node);
  if (domNode) {
    return domNode;
  }
  if (node instanceof import_react5.default.Component) {
    var _ReactDOM$findDOMNode;
    return (_ReactDOM$findDOMNode = import_react_dom.default.findDOMNode) === null || _ReactDOM$findDOMNode === void 0 ? void 0 : _ReactDOM$findDOMNode.call(import_react_dom.default, node);
  }
  return null;
}

// node_modules/rc-motion/es/CSSMotion.js
var React13 = __toESM(require_react());
var import_react9 = __toESM(require_react());

// node_modules/rc-motion/es/context.js
var React6 = __toESM(require_react());
var _excluded = ["children"];
var Context = React6.createContext({});
function MotionProvider(_ref) {
  var children = _ref.children, props = _objectWithoutProperties(_ref, _excluded);
  return React6.createElement(Context.Provider, {
    value: props
  }, children);
}

// node_modules/rc-motion/es/DomWrapper.js
var React7 = __toESM(require_react());
var DomWrapper = function(_React$Component) {
  _inherits(DomWrapper3, _React$Component);
  var _super = _createSuper(DomWrapper3);
  function DomWrapper3() {
    _classCallCheck(this, DomWrapper3);
    return _super.apply(this, arguments);
  }
  _createClass(DomWrapper3, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper3;
}(React7.Component);
var DomWrapper_default = DomWrapper;

// node_modules/rc-util/es/hooks/useSyncState.js
var React8 = __toESM(require_react());
function useSyncState(defaultValue) {
  var _React$useReducer = React8.useReducer(function(x) {
    return x + 1;
  }, 0), _React$useReducer2 = _slicedToArray(_React$useReducer, 2), forceUpdate = _React$useReducer2[1];
  var currentValueRef = React8.useRef(defaultValue);
  var getValue2 = useEvent(function() {
    return currentValueRef.current;
  });
  var setValue = useEvent(function(updater) {
    currentValueRef.current = typeof updater === "function" ? updater(currentValueRef.current) : updater;
    forceUpdate();
  });
  return [getValue2, setValue];
}

// node_modules/rc-motion/es/hooks/useStatus.js
var React12 = __toESM(require_react());
var import_react8 = __toESM(require_react());

// node_modules/rc-motion/es/interface.js
var STATUS_NONE = "none";
var STATUS_APPEAR = "appear";
var STATUS_ENTER = "enter";
var STATUS_LEAVE = "leave";
var STEP_NONE = "none";
var STEP_PREPARE = "prepare";
var STEP_START = "start";
var STEP_ACTIVE = "active";
var STEP_ACTIVATED = "end";
var STEP_PREPARED = "prepared";

// node_modules/rc-motion/es/hooks/useDomMotionEvents.js
var React9 = __toESM(require_react());
var import_react6 = __toESM(require_react());

// node_modules/rc-motion/es/util/motion.js
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit".concat(styleProp)] = "webkit".concat(eventName);
  prefixes["Moz".concat(styleProp)] = "moz".concat(eventName);
  prefixes["ms".concat(styleProp)] = "MS".concat(eventName);
  prefixes["O".concat(styleProp)] = "o".concat(eventName.toLowerCase());
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  var prefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  };
  if (domSupport) {
    if (!("AnimationEvent" in win)) {
      delete prefixes.animationend.animation;
    }
    if (!("TransitionEvent" in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
var vendorPrefixes = getVendorPrefixes(canUseDom(), typeof window !== "undefined" ? window : {});
var style = {};
if (canUseDom()) {
  _document$createEleme = document.createElement("div");
  style = _document$createEleme.style;
}
var _document$createEleme;
var prefixedEventNames = {};
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  var prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    var stylePropList = Object.keys(prefixMap);
    var len = stylePropList.length;
    for (var i = 0; i < len; i += 1) {
      var styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return "";
}
var internalAnimationEndName = getVendorPrefixedEventName("animationend");
var internalTransitionEndName = getVendorPrefixedEventName("transitionend");
var supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
var animationEndName = internalAnimationEndName || "animationend";
var transitionEndName = internalTransitionEndName || "transitionend";
function getTransitionName(transitionName, transitionType) {
  if (!transitionName) return null;
  if (_typeof(transitionName) === "object") {
    var type5 = transitionType.replace(/-\w/g, function(match) {
      return match[1].toUpperCase();
    });
    return transitionName[type5];
  }
  return "".concat(transitionName, "-").concat(transitionType);
}

// node_modules/rc-motion/es/hooks/useDomMotionEvents.js
var useDomMotionEvents_default = function(onInternalMotionEnd) {
  var cacheElementRef = (0, import_react6.useRef)();
  function removeMotionEvents(element) {
    if (element) {
      element.removeEventListener(transitionEndName, onInternalMotionEnd);
      element.removeEventListener(animationEndName, onInternalMotionEnd);
    }
  }
  function patchMotionEvents(element) {
    if (cacheElementRef.current && cacheElementRef.current !== element) {
      removeMotionEvents(cacheElementRef.current);
    }
    if (element && element !== cacheElementRef.current) {
      element.addEventListener(transitionEndName, onInternalMotionEnd);
      element.addEventListener(animationEndName, onInternalMotionEnd);
      cacheElementRef.current = element;
    }
  }
  React9.useEffect(function() {
    return function() {
      removeMotionEvents(cacheElementRef.current);
    };
  }, []);
  return [patchMotionEvents, removeMotionEvents];
};

// node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js
var import_react7 = __toESM(require_react());
var useIsomorphicLayoutEffect = canUseDom() ? import_react7.useLayoutEffect : import_react7.useEffect;
var useIsomorphicLayoutEffect_default = useIsomorphicLayoutEffect;

// node_modules/rc-motion/es/hooks/useStepQueue.js
var React11 = __toESM(require_react());

// node_modules/rc-util/es/raf.js
var raf = function raf2(callback) {
  return +setTimeout(callback, 16);
};
var caf = function caf2(num) {
  return clearTimeout(num);
};
if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
  raf = function raf3(callback) {
    return window.requestAnimationFrame(callback);
  };
  caf = function caf3(handle) {
    return window.cancelAnimationFrame(handle);
  };
}
var rafUUID = 0;
var rafIds = /* @__PURE__ */ new Map();
function cleanup(id) {
  rafIds.delete(id);
}
var wrapperRaf = function wrapperRaf2(callback) {
  var times = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  rafUUID += 1;
  var id = rafUUID;
  function callRef(leftTimes) {
    if (leftTimes === 0) {
      cleanup(id);
      callback();
    } else {
      var realId = raf(function() {
        callRef(leftTimes - 1);
      });
      rafIds.set(id, realId);
    }
  }
  callRef(times);
  return id;
};
wrapperRaf.cancel = function(id) {
  var realId = rafIds.get(id);
  cleanup(id);
  return caf(realId);
};
if (true) {
  wrapperRaf.ids = function() {
    return rafIds;
  };
}
var raf_default = wrapperRaf;

// node_modules/rc-motion/es/hooks/useNextFrame.js
var React10 = __toESM(require_react());
var useNextFrame_default = function() {
  var nextFrameRef = React10.useRef(null);
  function cancelNextFrame() {
    raf_default.cancel(nextFrameRef.current);
  }
  function nextFrame(callback) {
    var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
    cancelNextFrame();
    var nextFrameId = raf_default(function() {
      if (delay <= 1) {
        callback({
          isCanceled: function isCanceled() {
            return nextFrameId !== nextFrameRef.current;
          }
        });
      } else {
        nextFrame(callback, delay - 1);
      }
    });
    nextFrameRef.current = nextFrameId;
  }
  React10.useEffect(function() {
    return function() {
      cancelNextFrame();
    };
  }, []);
  return [nextFrame, cancelNextFrame];
};

// node_modules/rc-motion/es/hooks/useStepQueue.js
var FULL_STEP_QUEUE = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED];
var SIMPLE_STEP_QUEUE = [STEP_PREPARE, STEP_PREPARED];
var SkipStep = false;
var DoStep = true;
function isActive(step) {
  return step === STEP_ACTIVE || step === STEP_ACTIVATED;
}
var useStepQueue_default = function(status, prepareOnly, callback) {
  var _useState = useSafeState(STEP_NONE), _useState2 = _slicedToArray(_useState, 2), step = _useState2[0], setStep = _useState2[1];
  var _useNextFrame = useNextFrame_default(), _useNextFrame2 = _slicedToArray(_useNextFrame, 2), nextFrame = _useNextFrame2[0], cancelNextFrame = _useNextFrame2[1];
  function startQueue() {
    setStep(STEP_PREPARE, true);
  }
  var STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
  useIsomorphicLayoutEffect_default(function() {
    if (step !== STEP_NONE && step !== STEP_ACTIVATED) {
      var index2 = STEP_QUEUE.indexOf(step);
      var nextStep = STEP_QUEUE[index2 + 1];
      var result = callback(step);
      if (result === SkipStep) {
        setStep(nextStep, true);
      } else if (nextStep) {
        nextFrame(function(info) {
          function doNext() {
            if (info.isCanceled()) return;
            setStep(nextStep, true);
          }
          if (result === true) {
            doNext();
          } else {
            Promise.resolve(result).then(doNext);
          }
        });
      }
    }
  }, [status, step]);
  React11.useEffect(function() {
    return function() {
      cancelNextFrame();
    };
  }, []);
  return [startQueue, step];
};

// node_modules/rc-motion/es/hooks/useStatus.js
function useStatus(supportMotion, visible, getElement, _ref) {
  var _ref$motionEnter = _ref.motionEnter, motionEnter = _ref$motionEnter === void 0 ? true : _ref$motionEnter, _ref$motionAppear = _ref.motionAppear, motionAppear = _ref$motionAppear === void 0 ? true : _ref$motionAppear, _ref$motionLeave = _ref.motionLeave, motionLeave = _ref$motionLeave === void 0 ? true : _ref$motionLeave, motionDeadline = _ref.motionDeadline, motionLeaveImmediately = _ref.motionLeaveImmediately, onAppearPrepare = _ref.onAppearPrepare, onEnterPrepare = _ref.onEnterPrepare, onLeavePrepare = _ref.onLeavePrepare, onAppearStart = _ref.onAppearStart, onEnterStart = _ref.onEnterStart, onLeaveStart = _ref.onLeaveStart, onAppearActive = _ref.onAppearActive, onEnterActive = _ref.onEnterActive, onLeaveActive = _ref.onLeaveActive, onAppearEnd = _ref.onAppearEnd, onEnterEnd = _ref.onEnterEnd, onLeaveEnd = _ref.onLeaveEnd, onVisibleChanged = _ref.onVisibleChanged;
  var _useState = useSafeState(), _useState2 = _slicedToArray(_useState, 2), asyncVisible = _useState2[0], setAsyncVisible = _useState2[1];
  var _useSyncState = useSyncState(STATUS_NONE), _useSyncState2 = _slicedToArray(_useSyncState, 2), getStatus = _useSyncState2[0], setStatus = _useSyncState2[1];
  var _useState3 = useSafeState(null), _useState4 = _slicedToArray(_useState3, 2), style2 = _useState4[0], setStyle = _useState4[1];
  var currentStatus = getStatus();
  var mountedRef = (0, import_react8.useRef)(false);
  var deadlineRef = (0, import_react8.useRef)(null);
  function getDomElement() {
    return getElement();
  }
  var activeRef = (0, import_react8.useRef)(false);
  function updateMotionEndStatus() {
    setStatus(STATUS_NONE);
    setStyle(null, true);
  }
  var onInternalMotionEnd = useEvent(function(event) {
    var status = getStatus();
    if (status === STATUS_NONE) {
      return;
    }
    var element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      return;
    }
    var currentActive = activeRef.current;
    var canEnd;
    if (status === STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd === null || onAppearEnd === void 0 ? void 0 : onAppearEnd(element, event);
    } else if (status === STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd === null || onEnterEnd === void 0 ? void 0 : onEnterEnd(element, event);
    } else if (status === STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd === null || onLeaveEnd === void 0 ? void 0 : onLeaveEnd(element, event);
    }
    if (currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  });
  var _useDomMotionEvents = useDomMotionEvents_default(onInternalMotionEnd), _useDomMotionEvents2 = _slicedToArray(_useDomMotionEvents, 1), patchMotionEvents = _useDomMotionEvents2[0];
  var getEventHandlers = function getEventHandlers2(targetStatus) {
    switch (targetStatus) {
      case STATUS_APPEAR:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onAppearPrepare), STEP_START, onAppearStart), STEP_ACTIVE, onAppearActive);
      case STATUS_ENTER:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onEnterPrepare), STEP_START, onEnterStart), STEP_ACTIVE, onEnterActive);
      case STATUS_LEAVE:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onLeavePrepare), STEP_START, onLeaveStart), STEP_ACTIVE, onLeaveActive);
      default:
        return {};
    }
  };
  var eventHandlers = React12.useMemo(function() {
    return getEventHandlers(currentStatus);
  }, [currentStatus]);
  var _useStepQueue = useStepQueue_default(currentStatus, !supportMotion, function(newStep) {
    if (newStep === STEP_PREPARE) {
      var onPrepare = eventHandlers[STEP_PREPARE];
      if (!onPrepare) {
        return SkipStep;
      }
      return onPrepare(getDomElement());
    }
    if (step in eventHandlers) {
      var _eventHandlers$step;
      setStyle(((_eventHandlers$step = eventHandlers[step]) === null || _eventHandlers$step === void 0 ? void 0 : _eventHandlers$step.call(eventHandlers, getDomElement(), null)) || null);
    }
    if (step === STEP_ACTIVE && currentStatus !== STATUS_NONE) {
      patchMotionEvents(getDomElement());
      if (motionDeadline > 0) {
        clearTimeout(deadlineRef.current);
        deadlineRef.current = setTimeout(function() {
          onInternalMotionEnd({
            deadline: true
          });
        }, motionDeadline);
      }
    }
    if (step === STEP_PREPARED) {
      updateMotionEndStatus();
    }
    return DoStep;
  }), _useStepQueue2 = _slicedToArray(_useStepQueue, 2), startStep = _useStepQueue2[0], step = _useStepQueue2[1];
  var active = isActive(step);
  activeRef.current = active;
  var visibleRef = (0, import_react8.useRef)(null);
  useIsomorphicLayoutEffect_default(function() {
    if (mountedRef.current && visibleRef.current === visible) {
      return;
    }
    setAsyncVisible(visible);
    var isMounted = mountedRef.current;
    mountedRef.current = true;
    var nextStatus;
    if (!isMounted && visible && motionAppear) {
      nextStatus = STATUS_APPEAR;
    }
    if (isMounted && visible && motionEnter) {
      nextStatus = STATUS_ENTER;
    }
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = STATUS_LEAVE;
    }
    var nextEventHandlers = getEventHandlers(nextStatus);
    if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
      setStatus(nextStatus);
      startStep();
    } else {
      setStatus(STATUS_NONE);
    }
    visibleRef.current = visible;
  }, [visible]);
  (0, import_react8.useEffect)(function() {
    if (
      // Cancel appear
      currentStatus === STATUS_APPEAR && !motionAppear || // Cancel enter
      currentStatus === STATUS_ENTER && !motionEnter || // Cancel leave
      currentStatus === STATUS_LEAVE && !motionLeave
    ) {
      setStatus(STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0, import_react8.useEffect)(function() {
    return function() {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    };
  }, []);
  var firstMountChangeRef = React12.useRef(false);
  (0, import_react8.useEffect)(function() {
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== void 0 && currentStatus === STATUS_NONE) {
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged === null || onVisibleChanged === void 0 || onVisibleChanged(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, currentStatus]);
  var mergedStyle = style2;
  if (eventHandlers[STEP_PREPARE] && step === STEP_START) {
    mergedStyle = _objectSpread2({
      transition: "none"
    }, mergedStyle);
  }
  return [currentStatus, step, mergedStyle, asyncVisible !== null && asyncVisible !== void 0 ? asyncVisible : visible];
}

// node_modules/rc-motion/es/CSSMotion.js
function genCSSMotion(config) {
  var transitionSupport = config;
  if (_typeof(config) === "object") {
    transitionSupport = config.transitionSupport;
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  var CSSMotion = React13.forwardRef(function(props, ref) {
    var _props$visible = props.visible, visible = _props$visible === void 0 ? true : _props$visible, _props$removeOnLeave = props.removeOnLeave, removeOnLeave = _props$removeOnLeave === void 0 ? true : _props$removeOnLeave, forceRender = props.forceRender, children = props.children, motionName = props.motionName, leavedClassName = props.leavedClassName, eventProps = props.eventProps;
    var _React$useContext = React13.useContext(Context), contextMotion = _React$useContext.motion;
    var supportMotion = isSupportTransition(props, contextMotion);
    var nodeRef = (0, import_react9.useRef)();
    var wrapperNodeRef = (0, import_react9.useRef)();
    function getDomElement() {
      try {
        return nodeRef.current instanceof HTMLElement ? nodeRef.current : findDOMNode(wrapperNodeRef.current);
      } catch (e) {
        return null;
      }
    }
    var _useStatus = useStatus(supportMotion, visible, getDomElement, props), _useStatus2 = _slicedToArray(_useStatus, 4), status = _useStatus2[0], statusStep = _useStatus2[1], statusStyle = _useStatus2[2], mergedVisible = _useStatus2[3];
    var renderedRef = React13.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }
    var setNodeRef = React13.useCallback(function(node) {
      nodeRef.current = node;
      fillRef(ref, node);
    }, [ref]);
    var motionChildren;
    var mergedProps = _objectSpread2(_objectSpread2({}, eventProps), {}, {
      visible
    });
    if (!children) {
      motionChildren = null;
    } else if (status === STATUS_NONE) {
      if (mergedVisible) {
        motionChildren = children(_objectSpread2({}, mergedProps), setNodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          className: leavedClassName
        }), setNodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          style: {
            display: "none"
          }
        }), setNodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      var statusSuffix;
      if (statusStep === STEP_PREPARE) {
        statusSuffix = "prepare";
      } else if (isActive(statusStep)) {
        statusSuffix = "active";
      } else if (statusStep === STEP_START) {
        statusSuffix = "start";
      }
      var motionCls = getTransitionName(motionName, "".concat(status, "-").concat(statusSuffix));
      motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
        className: (0, import_classnames.default)(getTransitionName(motionName, status), _defineProperty(_defineProperty({}, motionCls, motionCls && statusSuffix), motionName, typeof motionName === "string")),
        style: statusStyle
      }), setNodeRef);
    }
    if (React13.isValidElement(motionChildren) && supportRef(motionChildren)) {
      var originNodeRef = getNodeRef(motionChildren);
      if (!originNodeRef) {
        motionChildren = React13.cloneElement(motionChildren, {
          ref: setNodeRef
        });
      }
    }
    return React13.createElement(DomWrapper_default, {
      ref: wrapperNodeRef
    }, motionChildren);
  });
  CSSMotion.displayName = "CSSMotion";
  return CSSMotion;
}
var CSSMotion_default = genCSSMotion(supportTransition);

// node_modules/rc-motion/es/CSSMotionList.js
var React14 = __toESM(require_react());

// node_modules/rc-motion/es/util/diff.js
var STATUS_ADD = "add";
var STATUS_KEEP = "keep";
var STATUS_REMOVE = "remove";
var STATUS_REMOVED = "removed";
function wrapKeyToObject(key) {
  var keyObj;
  if (key && _typeof(key) === "object" && "key" in key) {
    keyObj = key;
  } else {
    keyObj = {
      key
    };
  }
  return _objectSpread2(_objectSpread2({}, keyObj), {}, {
    key: String(keyObj.key)
  });
}
function parseKeys() {
  var keys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  return keys.map(wrapKeyToObject);
}
function diffKeys() {
  var prevKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  var currentKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var list = [];
  var currentIndex = 0;
  var currentLen = currentKeys.length;
  var prevKeyObjects = parseKeys(prevKeys);
  var currentKeyObjects = parseKeys(currentKeys);
  prevKeyObjects.forEach(function(keyObj) {
    var hit = false;
    for (var i = currentIndex; i < currentLen; i += 1) {
      var currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(function(obj) {
            return _objectSpread2(_objectSpread2({}, obj), {}, {
              status: STATUS_ADD
            });
          }));
          currentIndex = i;
        }
        list.push(_objectSpread2(_objectSpread2({}, currentKeyObj), {}, {
          status: STATUS_KEEP
        }));
        currentIndex += 1;
        hit = true;
        break;
      }
    }
    if (!hit) {
      list.push(_objectSpread2(_objectSpread2({}, keyObj), {}, {
        status: STATUS_REMOVE
      }));
    }
  });
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(function(obj) {
      return _objectSpread2(_objectSpread2({}, obj), {}, {
        status: STATUS_ADD
      });
    }));
  }
  var keys = {};
  list.forEach(function(_ref) {
    var key = _ref.key;
    keys[key] = (keys[key] || 0) + 1;
  });
  var duplicatedKeys = Object.keys(keys).filter(function(key) {
    return keys[key] > 1;
  });
  duplicatedKeys.forEach(function(matchKey) {
    list = list.filter(function(_ref2) {
      var key = _ref2.key, status = _ref2.status;
      return key !== matchKey || status !== STATUS_REMOVE;
    });
    list.forEach(function(node) {
      if (node.key === matchKey) {
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}

// node_modules/rc-motion/es/CSSMotionList.js
var _excluded2 = ["component", "children", "onVisibleChanged", "onAllRemoved"];
var _excluded22 = ["status"];
var MOTION_PROP_NAMES = ["eventProps", "visible", "children", "motionName", "motionAppear", "motionEnter", "motionLeave", "motionLeaveImmediately", "motionDeadline", "removeOnLeave", "leavedClassName", "onAppearPrepare", "onAppearStart", "onAppearActive", "onAppearEnd", "onEnterStart", "onEnterActive", "onEnterEnd", "onLeaveStart", "onLeaveActive", "onLeaveEnd"];
function genCSSMotionList(transitionSupport) {
  var CSSMotion = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : CSSMotion_default;
  var CSSMotionList = function(_React$Component) {
    _inherits(CSSMotionList2, _React$Component);
    var _super = _createSuper(CSSMotionList2);
    function CSSMotionList2() {
      var _this;
      _classCallCheck(this, CSSMotionList2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "state", {
        keyEntities: []
      });
      _defineProperty(_assertThisInitialized(_this), "removeKey", function(removeKey) {
        _this.setState(function(prevState) {
          var nextKeyEntities = prevState.keyEntities.map(function(entity) {
            if (entity.key !== removeKey) return entity;
            return _objectSpread2(_objectSpread2({}, entity), {}, {
              status: STATUS_REMOVED
            });
          });
          return {
            keyEntities: nextKeyEntities
          };
        }, function() {
          var keyEntities = _this.state.keyEntities;
          var restKeysCount = keyEntities.filter(function(_ref) {
            var status = _ref.status;
            return status !== STATUS_REMOVED;
          }).length;
          if (restKeysCount === 0 && _this.props.onAllRemoved) {
            _this.props.onAllRemoved();
          }
        });
      });
      return _this;
    }
    _createClass(CSSMotionList2, [{
      key: "render",
      value: function render() {
        var _this2 = this;
        var keyEntities = this.state.keyEntities;
        var _this$props = this.props, component = _this$props.component, children = _this$props.children, _onVisibleChanged = _this$props.onVisibleChanged, onAllRemoved = _this$props.onAllRemoved, restProps = _objectWithoutProperties(_this$props, _excluded2);
        var Component6 = component || React14.Fragment;
        var motionProps = {};
        MOTION_PROP_NAMES.forEach(function(prop) {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return React14.createElement(Component6, restProps, keyEntities.map(function(_ref2, index2) {
          var status = _ref2.status, eventProps = _objectWithoutProperties(_ref2, _excluded22);
          var visible = status === STATUS_ADD || status === STATUS_KEEP;
          return React14.createElement(CSSMotion, _extends({}, motionProps, {
            key: eventProps.key,
            visible,
            eventProps,
            onVisibleChanged: function onVisibleChanged(changedVisible) {
              _onVisibleChanged === null || _onVisibleChanged === void 0 || _onVisibleChanged(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                _this2.removeKey(eventProps.key);
              }
            }
          }), function(props, ref) {
            return children(_objectSpread2(_objectSpread2({}, props), {}, {
              index: index2
            }), ref);
          });
        }));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref3, _ref4) {
        var keys = _ref3.keys;
        var keyEntities = _ref4.keyEntities;
        var parsedKeyObjects = parseKeys(keys);
        var mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter(function(entity) {
            var prevEntity = keyEntities.find(function(_ref5) {
              var key = _ref5.key;
              return entity.key === key;
            });
            if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
    }]);
    return CSSMotionList2;
  }(React14.Component);
  _defineProperty(CSSMotionList, "defaultProps", {
    component: "div"
  });
  return CSSMotionList;
}
var CSSMotionList_default = genCSSMotionList(supportTransition);

// node_modules/rc-motion/es/index.js
var es_default = CSSMotion_default;

// node_modules/antd/es/config-provider/MotionWrapper.js
var MotionCacheContext = React15.createContext(true);
if (true) {
  MotionCacheContext.displayName = "MotionCacheContext";
}
function MotionWrapper(props) {
  const parentMotion = React15.useContext(MotionCacheContext);
  const {
    children
  } = props;
  const [, token] = useToken();
  const {
    motion: motion2
  } = token;
  const needWrapMotionProviderRef = React15.useRef(false);
  needWrapMotionProviderRef.current || (needWrapMotionProviderRef.current = parentMotion !== motion2);
  if (needWrapMotionProviderRef.current) {
    return React15.createElement(MotionCacheContext.Provider, {
      value: motion2
    }, React15.createElement(MotionProvider, {
      motion: motion2
    }, children));
  }
  return children;
}

// node_modules/antd/es/config-provider/PropWarning.js
var React16 = __toESM(require_react());
var PropWarning = React16.memo(({
  dropdownMatchSelectWidth
}) => {
  const warning5 = devUseWarning("ConfigProvider");
  warning5.deprecated(dropdownMatchSelectWidth === void 0, "dropdownMatchSelectWidth", "popupMatchSelectWidth");
  return null;
});
if (true) {
  PropWarning.displayName = "PropWarning";
}
var PropWarning_default = true ? PropWarning : () => null;

// node_modules/antd/es/config-provider/index.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var existThemeConfig = false;
var warnContext = true ? (componentName) => {
  true ? warning_default2(!existThemeConfig, componentName, `Static function can not consume context like dynamic theme. Please use 'App' component instead.`) : void 0;
} : (
  /* istanbul ignore next */
  null
);
var PASSED_PROPS = ["getTargetContainer", "getPopupContainer", "renderEmpty", "input", "pagination", "form", "select", "button"];
var globalPrefixCls;
var globalIconPrefixCls;
var globalTheme;
var globalHolderRender;
function getGlobalPrefixCls() {
  return globalPrefixCls || defaultPrefixCls;
}
function getGlobalIconPrefixCls() {
  return globalIconPrefixCls || defaultIconPrefixCls;
}
function isLegacyTheme(theme) {
  return Object.keys(theme).some((key) => key.endsWith("Color"));
}
var setGlobalConfig = (props) => {
  const {
    prefixCls,
    iconPrefixCls,
    theme,
    holderRender
  } = props;
  if (prefixCls !== void 0) {
    globalPrefixCls = prefixCls;
  }
  if (iconPrefixCls !== void 0) {
    globalIconPrefixCls = iconPrefixCls;
  }
  if ("holderRender" in props) {
    globalHolderRender = holderRender;
  }
  if (theme) {
    if (isLegacyTheme(theme)) {
      true ? warning_default2(false, "ConfigProvider", "`config` of css variable theme is not work in v5. Please use new `theme` config instead.") : void 0;
      registerTheme(getGlobalPrefixCls(), theme);
    } else {
      globalTheme = theme;
    }
  }
};
var globalConfig = () => ({
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
  },
  getIconPrefixCls: getGlobalIconPrefixCls,
  getRootPrefixCls: () => {
    if (globalPrefixCls) {
      return globalPrefixCls;
    }
    return getGlobalPrefixCls();
  },
  getTheme: () => globalTheme,
  holderRender: globalHolderRender
});
var ProviderChildren = (props) => {
  const {
    children,
    csp: customCsp,
    autoInsertSpaceInButton,
    alert,
    anchor,
    form,
    locale: locale5,
    componentSize,
    direction,
    space,
    splitter,
    virtual,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    popupOverflow,
    legacyLocale,
    parentContext,
    iconPrefixCls: customIconPrefixCls,
    theme,
    componentDisabled,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    menu,
    pagination,
    input,
    textArea,
    empty,
    badge,
    radio,
    rate,
    switch: SWITCH,
    transfer,
    avatar,
    message,
    tag,
    table,
    card,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect
  } = props;
  const getPrefixCls = React17.useCallback((suffixCls, customizePrefixCls) => {
    const {
      prefixCls
    } = props;
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    const mergedPrefixCls = prefixCls || parentContext.getPrefixCls("");
    return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
  }, [parentContext.getPrefixCls, props.prefixCls]);
  const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || defaultIconPrefixCls;
  const csp = customCsp || parentContext.csp;
  useResetIconStyle_default(iconPrefixCls, csp);
  const mergedTheme = useTheme(theme, parentContext.theme, {
    prefixCls: getPrefixCls("")
  });
  if (true) {
    existThemeConfig = existThemeConfig || !!mergedTheme;
  }
  const baseConfig = {
    csp,
    autoInsertSpaceInButton,
    alert,
    anchor,
    locale: locale5 || legacyLocale,
    direction,
    space,
    splitter,
    virtual,
    popupMatchSelectWidth: popupMatchSelectWidth !== null && popupMatchSelectWidth !== void 0 ? popupMatchSelectWidth : dropdownMatchSelectWidth,
    popupOverflow,
    getPrefixCls,
    iconPrefixCls,
    theme: mergedTheme,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    input,
    textArea,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    menu,
    pagination,
    empty,
    badge,
    radio,
    rate,
    switch: SWITCH,
    transfer,
    avatar,
    message,
    tag,
    table,
    card,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect
  };
  if (true) {
    const warningFn = devUseWarning("ConfigProvider");
    warningFn(!("autoInsertSpaceInButton" in props), "deprecated", "`autoInsertSpaceInButton` is deprecated. Please use `{ button: { autoInsertSpace: boolean }}` instead.");
  }
  const config = Object.assign({}, parentContext);
  Object.keys(baseConfig).forEach((key) => {
    if (baseConfig[key] !== void 0) {
      config[key] = baseConfig[key];
    }
  });
  PASSED_PROPS.forEach((propName) => {
    const propValue = props[propName];
    if (propValue) {
      config[propName] = propValue;
    }
  });
  if (typeof autoInsertSpaceInButton !== "undefined") {
    config.button = Object.assign({
      autoInsertSpace: autoInsertSpaceInButton
    }, config.button);
  }
  const memoedConfig = useMemo(() => config, config, (prevConfig, currentConfig) => {
    const prevKeys = Object.keys(prevConfig);
    const currentKeys = Object.keys(currentConfig);
    return prevKeys.length !== currentKeys.length || prevKeys.some((key) => prevConfig[key] !== currentConfig[key]);
  });
  const {
    layer
  } = React17.useContext(StyleContext_default);
  const memoIconContextValue = React17.useMemo(() => ({
    prefixCls: iconPrefixCls,
    csp,
    layer: layer ? "antd" : void 0
  }), [iconPrefixCls, csp, layer]);
  let childNode = React17.createElement(React17.Fragment, null, React17.createElement(PropWarning_default, {
    dropdownMatchSelectWidth
  }), children);
  const validateMessages = React17.useMemo(() => {
    var _a, _b, _c, _d;
    return merge(((_a = en_US_default6.Form) === null || _a === void 0 ? void 0 : _a.defaultValidateMessages) || {}, ((_c = (_b = memoedConfig.locale) === null || _b === void 0 ? void 0 : _b.Form) === null || _c === void 0 ? void 0 : _c.defaultValidateMessages) || {}, ((_d = memoedConfig.form) === null || _d === void 0 ? void 0 : _d.validateMessages) || {}, (form === null || form === void 0 ? void 0 : form.validateMessages) || {});
  }, [memoedConfig, form === null || form === void 0 ? void 0 : form.validateMessages]);
  if (Object.keys(validateMessages).length > 0) {
    childNode = React17.createElement(validateMessagesContext_default.Provider, {
      value: validateMessages
    }, childNode);
  }
  if (locale5) {
    childNode = React17.createElement(locale_default, {
      locale: locale5,
      _ANT_MARK__: ANT_MARK
    }, childNode);
  }
  if (iconPrefixCls || csp) {
    childNode = React17.createElement(Context_default.Provider, {
      value: memoIconContextValue
    }, childNode);
  }
  if (componentSize) {
    childNode = React17.createElement(SizeContextProvider, {
      size: componentSize
    }, childNode);
  }
  childNode = React17.createElement(MotionWrapper, null, childNode);
  const memoTheme = React17.useMemo(() => {
    const _a = mergedTheme || {}, {
      algorithm,
      token,
      components,
      cssVar
    } = _a, rest = __rest(_a, ["algorithm", "token", "components", "cssVar"]);
    const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? createTheme(algorithm) : theme_default;
    const parsedComponents = {};
    Object.entries(components || {}).forEach(([componentName, componentToken]) => {
      const parsedToken = Object.assign({}, componentToken);
      if ("algorithm" in parsedToken) {
        if (parsedToken.algorithm === true) {
          parsedToken.theme = themeObj;
        } else if (Array.isArray(parsedToken.algorithm) || typeof parsedToken.algorithm === "function") {
          parsedToken.theme = createTheme(parsedToken.algorithm);
        }
        delete parsedToken.algorithm;
      }
      parsedComponents[componentName] = parsedToken;
    });
    const mergedToken = Object.assign(Object.assign({}, seed_default), token);
    return Object.assign(Object.assign({}, rest), {
      theme: themeObj,
      token: mergedToken,
      components: parsedComponents,
      override: Object.assign({
        override: mergedToken
      }, parsedComponents),
      cssVar
    });
  }, [mergedTheme]);
  if (theme) {
    childNode = React17.createElement(DesignTokenContext.Provider, {
      value: memoTheme
    }, childNode);
  }
  if (memoedConfig.warning) {
    childNode = React17.createElement(WarningContext.Provider, {
      value: memoedConfig.warning
    }, childNode);
  }
  if (componentDisabled !== void 0) {
    childNode = React17.createElement(DisabledContextProvider, {
      disabled: componentDisabled
    }, childNode);
  }
  return React17.createElement(ConfigContext.Provider, {
    value: memoedConfig
  }, childNode);
};
var ConfigProvider = (props) => {
  const context = React17.useContext(ConfigContext);
  const antLocale = React17.useContext(context_default);
  return React17.createElement(ProviderChildren, Object.assign({
    parentContext: context,
    legacyLocale: antLocale
  }, props));
};
ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.SizeContext = SizeContext_default;
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = useConfig_default;
Object.defineProperty(ConfigProvider, "SizeContext", {
  get: () => {
    true ? warning_default2(false, "ConfigProvider", "ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.") : void 0;
    return SizeContext_default;
  }
});
if (true) {
  ConfigProvider.displayName = "ConfigProvider";
}
var config_provider_default = ConfigProvider;

// node_modules/antd/es/skeleton/Skeleton.js
var React26 = __toESM(require_react());
var import_classnames10 = __toESM(require_classnames());

// node_modules/antd/es/skeleton/Avatar.js
var React19 = __toESM(require_react());
var import_classnames3 = __toESM(require_classnames());

// node_modules/antd/es/skeleton/Element.js
var React18 = __toESM(require_react());
var import_classnames2 = __toESM(require_classnames());
var Element2 = (props) => {
  const {
    prefixCls,
    className,
    style: style2,
    size,
    shape
  } = props;
  const sizeCls = (0, import_classnames2.default)({
    [`${prefixCls}-lg`]: size === "large",
    [`${prefixCls}-sm`]: size === "small"
  });
  const shapeCls = (0, import_classnames2.default)({
    [`${prefixCls}-circle`]: shape === "circle",
    [`${prefixCls}-square`]: shape === "square",
    [`${prefixCls}-round`]: shape === "round"
  });
  const sizeStyle = React18.useMemo(() => typeof size === "number" ? {
    width: size,
    height: size,
    lineHeight: `${size}px`
  } : {}, [size]);
  return React18.createElement("span", {
    className: (0, import_classnames2.default)(prefixCls, sizeCls, shapeCls, className),
    style: Object.assign(Object.assign({}, sizeStyle), style2)
  });
};
var Element_default = Element2;

// node_modules/antd/es/skeleton/style/index.js
var skeletonClsLoading = new Keyframes_default(`ant-skeleton-loading`, {
  "0%": {
    backgroundPosition: "100% 50%"
  },
  "100%": {
    backgroundPosition: "0 50%"
  }
});
var genSkeletonElementCommonSize = (size) => ({
  height: size,
  lineHeight: unit(size)
});
var genSkeletonElementAvatarSize = (size) => Object.assign({
  width: size
}, genSkeletonElementCommonSize(size));
var genSkeletonColor = (token) => ({
  background: token.skeletonLoadingBackground,
  backgroundSize: "400% 100%",
  animationName: skeletonClsLoading,
  animationDuration: token.skeletonLoadingMotionDuration,
  animationTimingFunction: "ease",
  animationIterationCount: "infinite"
});
var genSkeletonElementInputSize = (size, calc) => Object.assign({
  width: calc(size).mul(5).equal(),
  minWidth: calc(size).mul(5).equal()
}, genSkeletonElementCommonSize(size));
var genSkeletonElementAvatar = (token) => {
  const {
    skeletonAvatarCls,
    gradientFromColor,
    controlHeight,
    controlHeightLG,
    controlHeightSM
  } = token;
  return {
    [skeletonAvatarCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor
    }, genSkeletonElementAvatarSize(controlHeight)),
    [`${skeletonAvatarCls}${skeletonAvatarCls}-circle`]: {
      borderRadius: "50%"
    },
    [`${skeletonAvatarCls}${skeletonAvatarCls}-lg`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightLG)),
    [`${skeletonAvatarCls}${skeletonAvatarCls}-sm`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightSM))
  };
};
var genSkeletonElementInput = (token) => {
  const {
    controlHeight,
    borderRadiusSM,
    skeletonInputCls,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    calc
  } = token;
  return {
    [skeletonInputCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor,
      borderRadius: borderRadiusSM
    }, genSkeletonElementInputSize(controlHeight, calc)),
    [`${skeletonInputCls}-lg`]: Object.assign({}, genSkeletonElementInputSize(controlHeightLG, calc)),
    [`${skeletonInputCls}-sm`]: Object.assign({}, genSkeletonElementInputSize(controlHeightSM, calc))
  };
};
var genSkeletonElementImageSize = (size) => Object.assign({
  width: size
}, genSkeletonElementCommonSize(size));
var genSkeletonElementImage = (token) => {
  const {
    skeletonImageCls,
    imageSizeBase,
    gradientFromColor,
    borderRadiusSM,
    calc
  } = token;
  return {
    [skeletonImageCls]: Object.assign(Object.assign({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      background: gradientFromColor,
      borderRadius: borderRadiusSM
    }, genSkeletonElementImageSize(calc(imageSizeBase).mul(2).equal())), {
      [`${skeletonImageCls}-path`]: {
        fill: "#bfbfbf"
      },
      [`${skeletonImageCls}-svg`]: Object.assign(Object.assign({}, genSkeletonElementImageSize(imageSizeBase)), {
        maxWidth: calc(imageSizeBase).mul(4).equal(),
        maxHeight: calc(imageSizeBase).mul(4).equal()
      }),
      [`${skeletonImageCls}-svg${skeletonImageCls}-svg-circle`]: {
        borderRadius: "50%"
      }
    }),
    [`${skeletonImageCls}${skeletonImageCls}-circle`]: {
      borderRadius: "50%"
    }
  };
};
var genSkeletonElementButtonShape = (token, size, buttonCls) => {
  const {
    skeletonButtonCls
  } = token;
  return {
    [`${buttonCls}${skeletonButtonCls}-circle`]: {
      width: size,
      minWidth: size,
      borderRadius: "50%"
    },
    [`${buttonCls}${skeletonButtonCls}-round`]: {
      borderRadius: size
    }
  };
};
var genSkeletonElementButtonSize = (size, calc) => Object.assign({
  width: calc(size).mul(2).equal(),
  minWidth: calc(size).mul(2).equal()
}, genSkeletonElementCommonSize(size));
var genSkeletonElementButton = (token) => {
  const {
    borderRadiusSM,
    skeletonButtonCls,
    controlHeight,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    calc
  } = token;
  return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
    [skeletonButtonCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor,
      borderRadius: borderRadiusSM,
      width: calc(controlHeight).mul(2).equal(),
      minWidth: calc(controlHeight).mul(2).equal()
    }, genSkeletonElementButtonSize(controlHeight, calc))
  }, genSkeletonElementButtonShape(token, controlHeight, skeletonButtonCls)), {
    [`${skeletonButtonCls}-lg`]: Object.assign({}, genSkeletonElementButtonSize(controlHeightLG, calc))
  }), genSkeletonElementButtonShape(token, controlHeightLG, `${skeletonButtonCls}-lg`)), {
    [`${skeletonButtonCls}-sm`]: Object.assign({}, genSkeletonElementButtonSize(controlHeightSM, calc))
  }), genSkeletonElementButtonShape(token, controlHeightSM, `${skeletonButtonCls}-sm`));
};
var genBaseStyle = (token) => {
  const {
    componentCls,
    skeletonAvatarCls,
    skeletonTitleCls,
    skeletonParagraphCls,
    skeletonButtonCls,
    skeletonInputCls,
    skeletonImageCls,
    controlHeight,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    padding,
    marginSM,
    borderRadius,
    titleHeight,
    blockRadius,
    paragraphLiHeight,
    controlHeightXS,
    paragraphMarginTop
  } = token;
  return {
    [componentCls]: {
      display: "table",
      width: "100%",
      [`${componentCls}-header`]: {
        display: "table-cell",
        paddingInlineEnd: padding,
        verticalAlign: "top",
        // Avatar
        [skeletonAvatarCls]: Object.assign({
          display: "inline-block",
          verticalAlign: "top",
          background: gradientFromColor
        }, genSkeletonElementAvatarSize(controlHeight)),
        [`${skeletonAvatarCls}-circle`]: {
          borderRadius: "50%"
        },
        [`${skeletonAvatarCls}-lg`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightLG)),
        [`${skeletonAvatarCls}-sm`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightSM))
      },
      [`${componentCls}-content`]: {
        display: "table-cell",
        width: "100%",
        verticalAlign: "top",
        // Title
        [skeletonTitleCls]: {
          width: "100%",
          height: titleHeight,
          background: gradientFromColor,
          borderRadius: blockRadius,
          [`+ ${skeletonParagraphCls}`]: {
            marginBlockStart: controlHeightSM
          }
        },
        // paragraph
        [skeletonParagraphCls]: {
          padding: 0,
          "> li": {
            width: "100%",
            height: paragraphLiHeight,
            listStyle: "none",
            background: gradientFromColor,
            borderRadius: blockRadius,
            "+ li": {
              marginBlockStart: controlHeightXS
            }
          }
        },
        [`${skeletonParagraphCls}> li:last-child:not(:first-child):not(:nth-child(2))`]: {
          width: "61%"
        }
      },
      [`&-round ${componentCls}-content`]: {
        [`${skeletonTitleCls}, ${skeletonParagraphCls} > li`]: {
          borderRadius
        }
      }
    },
    [`${componentCls}-with-avatar ${componentCls}-content`]: {
      // Title
      [skeletonTitleCls]: {
        marginBlockStart: marginSM,
        [`+ ${skeletonParagraphCls}`]: {
          marginBlockStart: paragraphMarginTop
        }
      }
    },
    // Skeleton element
    [`${componentCls}${componentCls}-element`]: Object.assign(Object.assign(Object.assign(Object.assign({
      display: "inline-block",
      width: "auto"
    }, genSkeletonElementButton(token)), genSkeletonElementAvatar(token)), genSkeletonElementInput(token)), genSkeletonElementImage(token)),
    // Skeleton Block Button, Input
    [`${componentCls}${componentCls}-block`]: {
      width: "100%",
      [skeletonButtonCls]: {
        width: "100%"
      },
      [skeletonInputCls]: {
        width: "100%"
      }
    },
    // With active animation
    [`${componentCls}${componentCls}-active`]: {
      [`
        ${skeletonTitleCls},
        ${skeletonParagraphCls} > li,
        ${skeletonAvatarCls},
        ${skeletonButtonCls},
        ${skeletonInputCls},
        ${skeletonImageCls}
      `]: Object.assign({}, genSkeletonColor(token))
    }
  };
};
var prepareComponentToken = (token) => {
  const {
    colorFillContent,
    colorFill
  } = token;
  const gradientFromColor = colorFillContent;
  const gradientToColor = colorFill;
  return {
    color: gradientFromColor,
    colorGradientEnd: gradientToColor,
    gradientFromColor,
    gradientToColor,
    titleHeight: token.controlHeight / 2,
    blockRadius: token.borderRadiusSM,
    paragraphMarginTop: token.marginLG + token.marginXXS,
    paragraphLiHeight: token.controlHeight / 2
  };
};
var style_default = genStyleHooks("Skeleton", (token) => {
  const {
    componentCls,
    calc
  } = token;
  const skeletonToken = merge2(token, {
    skeletonAvatarCls: `${componentCls}-avatar`,
    skeletonTitleCls: `${componentCls}-title`,
    skeletonParagraphCls: `${componentCls}-paragraph`,
    skeletonButtonCls: `${componentCls}-button`,
    skeletonInputCls: `${componentCls}-input`,
    skeletonImageCls: `${componentCls}-image`,
    imageSizeBase: calc(token.controlHeight).mul(1.5).equal(),
    borderRadius: 100,
    // Large number to make capsule shape
    skeletonLoadingBackground: `linear-gradient(90deg, ${token.gradientFromColor} 25%, ${token.gradientToColor} 37%, ${token.gradientFromColor} 63%)`,
    skeletonLoadingMotionDuration: "1.4s"
  });
  return [genBaseStyle(skeletonToken)];
}, prepareComponentToken, {
  deprecatedTokens: [["color", "gradientFromColor"], ["colorGradientEnd", "gradientToColor"]]
});

// node_modules/antd/es/skeleton/Avatar.js
var SkeletonAvatar = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    shape = "circle",
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = React19.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const otherProps = omit(props, ["prefixCls", "className"]);
  const cls = (0, import_classnames3.default)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(React19.createElement("div", {
    className: cls
  }, React19.createElement(Element_default, Object.assign({
    prefixCls: `${prefixCls}-avatar`,
    shape,
    size
  }, otherProps))));
};
var Avatar_default = SkeletonAvatar;

// node_modules/antd/es/skeleton/Button.js
var React20 = __toESM(require_react());
var import_classnames4 = __toESM(require_classnames());
var SkeletonButton = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    block = false,
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = React20.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const otherProps = omit(props, ["prefixCls"]);
  const cls = (0, import_classnames4.default)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(React20.createElement("div", {
    className: cls
  }, React20.createElement(Element_default, Object.assign({
    prefixCls: `${prefixCls}-button`,
    size
  }, otherProps))));
};
var Button_default = SkeletonButton;

// node_modules/antd/es/skeleton/Image.js
var React21 = __toESM(require_react());
var import_classnames5 = __toESM(require_classnames());
var path = "M365.714286 329.142857q0 45.714286-32.036571 77.677714t-77.677714 32.036571-77.677714-32.036571-32.036571-77.677714 32.036571-77.677714 77.677714-32.036571 77.677714 32.036571 32.036571 77.677714zM950.857143 548.571429l0 256-804.571429 0 0-109.714286 182.857143-182.857143 91.428571 91.428571 292.571429-292.571429zM1005.714286 146.285714l-914.285714 0q-7.460571 0-12.873143 5.412571t-5.412571 12.873143l0 694.857143q0 7.460571 5.412571 12.873143t12.873143 5.412571l914.285714 0q7.460571 0 12.873143-5.412571t5.412571-12.873143l0-694.857143q0-7.460571-5.412571-12.873143t-12.873143-5.412571zM1097.142857 164.571429l0 694.857143q0 37.741714-26.843429 64.585143t-64.585143 26.843429l-914.285714 0q-37.741714 0-64.585143-26.843429t-26.843429-64.585143l0-694.857143q0-37.741714 26.843429-64.585143t64.585143-26.843429l914.285714 0q37.741714 0 64.585143 26.843429t26.843429 64.585143z";
var SkeletonImage = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style: style2,
    active
  } = props;
  const {
    getPrefixCls
  } = React21.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const cls = (0, import_classnames5.default)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(React21.createElement("div", {
    className: cls
  }, React21.createElement("div", {
    className: (0, import_classnames5.default)(`${prefixCls}-image`, className),
    style: style2
  }, React21.createElement("svg", {
    viewBox: "0 0 1098 1024",
    xmlns: "http://www.w3.org/2000/svg",
    className: `${prefixCls}-image-svg`
  }, React21.createElement("title", null, "Image placeholder"), React21.createElement("path", {
    d: path,
    className: `${prefixCls}-image-path`
  })))));
};
var Image_default = SkeletonImage;

// node_modules/antd/es/skeleton/Input.js
var React22 = __toESM(require_react());
var import_classnames6 = __toESM(require_classnames());
var SkeletonInput = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    block,
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = React22.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const otherProps = omit(props, ["prefixCls"]);
  const cls = (0, import_classnames6.default)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(React22.createElement("div", {
    className: cls
  }, React22.createElement(Element_default, Object.assign({
    prefixCls: `${prefixCls}-input`,
    size
  }, otherProps))));
};
var Input_default = SkeletonInput;

// node_modules/antd/es/skeleton/Node.js
var React23 = __toESM(require_react());
var import_classnames7 = __toESM(require_classnames());
var SkeletonNode = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style: style2,
    active,
    children
  } = props;
  const {
    getPrefixCls
  } = React23.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const cls = (0, import_classnames7.default)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, hashId, className, rootClassName, cssVarCls);
  return wrapCSSVar(React23.createElement("div", {
    className: cls
  }, React23.createElement("div", {
    className: (0, import_classnames7.default)(`${prefixCls}-image`, className),
    style: style2
  }, children)));
};
var Node_default = SkeletonNode;

// node_modules/antd/es/skeleton/Paragraph.js
var React24 = __toESM(require_react());
var import_classnames8 = __toESM(require_classnames());
var getWidth = (index2, props) => {
  const {
    width,
    rows = 2
  } = props;
  if (Array.isArray(width)) {
    return width[index2];
  }
  if (rows - 1 === index2) {
    return width;
  }
  return void 0;
};
var Paragraph = (props) => {
  const {
    prefixCls,
    className,
    style: style2,
    rows = 0
  } = props;
  const rowList = Array.from({
    length: rows
  }).map((_, index2) => (
    // eslint-disable-next-line react/no-array-index-key
    React24.createElement("li", {
      key: index2,
      style: {
        width: getWidth(index2, props)
      }
    })
  ));
  return React24.createElement("ul", {
    className: (0, import_classnames8.default)(prefixCls, className),
    style: style2
  }, rowList);
};
var Paragraph_default = Paragraph;

// node_modules/antd/es/skeleton/Title.js
var React25 = __toESM(require_react());
var import_classnames9 = __toESM(require_classnames());
var Title = ({
  prefixCls,
  className,
  width,
  style: style2
}) => (
  // biome-ignore lint/a11y/useHeadingContent: HOC here
  React25.createElement("h3", {
    className: (0, import_classnames9.default)(prefixCls, className),
    style: Object.assign({
      width
    }, style2)
  })
);
var Title_default = Title;

// node_modules/antd/es/skeleton/Skeleton.js
function getComponentProps(prop) {
  if (prop && typeof prop === "object") {
    return prop;
  }
  return {};
}
function getAvatarBasicProps(hasTitle, hasParagraph) {
  if (hasTitle && !hasParagraph) {
    return {
      size: "large",
      shape: "square"
    };
  }
  return {
    size: "large",
    shape: "circle"
  };
}
function getTitleBasicProps(hasAvatar, hasParagraph) {
  if (!hasAvatar && hasParagraph) {
    return {
      width: "38%"
    };
  }
  if (hasAvatar && hasParagraph) {
    return {
      width: "50%"
    };
  }
  return {};
}
function getParagraphBasicProps(hasAvatar, hasTitle) {
  const basicProps = {};
  if (!hasAvatar || !hasTitle) {
    basicProps.width = "61%";
  }
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }
  return basicProps;
}
var Skeleton = (props) => {
  const {
    prefixCls: customizePrefixCls,
    loading,
    className,
    rootClassName,
    style: style2,
    children,
    avatar = false,
    title = true,
    paragraph = true,
    active,
    round
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("skeleton");
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  if (loading || !("loading" in props)) {
    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;
    let avatarNode;
    if (hasAvatar) {
      const avatarProps = Object.assign(Object.assign({
        prefixCls: `${prefixCls}-avatar`
      }, getAvatarBasicProps(hasTitle, hasParagraph)), getComponentProps(avatar));
      avatarNode = React26.createElement("div", {
        className: `${prefixCls}-header`
      }, React26.createElement(Element_default, Object.assign({}, avatarProps)));
    }
    let contentNode;
    if (hasTitle || hasParagraph) {
      let $title;
      if (hasTitle) {
        const titleProps = Object.assign(Object.assign({
          prefixCls: `${prefixCls}-title`
        }, getTitleBasicProps(hasAvatar, hasParagraph)), getComponentProps(title));
        $title = React26.createElement(Title_default, Object.assign({}, titleProps));
      }
      let paragraphNode;
      if (hasParagraph) {
        const paragraphProps = Object.assign(Object.assign({
          prefixCls: `${prefixCls}-paragraph`
        }, getParagraphBasicProps(hasAvatar, hasTitle)), getComponentProps(paragraph));
        paragraphNode = React26.createElement(Paragraph_default, Object.assign({}, paragraphProps));
      }
      contentNode = React26.createElement("div", {
        className: `${prefixCls}-content`
      }, $title, paragraphNode);
    }
    const cls = (0, import_classnames10.default)(prefixCls, {
      [`${prefixCls}-with-avatar`]: hasAvatar,
      [`${prefixCls}-active`]: active,
      [`${prefixCls}-rtl`]: direction === "rtl",
      [`${prefixCls}-round`]: round
    }, contextClassName, className, rootClassName, hashId, cssVarCls);
    return wrapCSSVar(React26.createElement("div", {
      className: cls,
      style: Object.assign(Object.assign({}, contextStyle), style2)
    }, avatarNode, contentNode));
  }
  return children !== null && children !== void 0 ? children : null;
};
Skeleton.Button = Button_default;
Skeleton.Avatar = Avatar_default;
Skeleton.Input = Input_default;
Skeleton.Image = Image_default;
Skeleton.Node = Node_default;
if (true) {
  Skeleton.displayName = "Skeleton";
}
var Skeleton_default = Skeleton;

// node_modules/antd/es/skeleton/index.js
var skeleton_default = Skeleton_default;

// node_modules/antd/es/tabs/index.js
var React95 = __toESM(require_react());

// node_modules/antd/node_modules/@ant-design/icons/es/icons/CloseOutlined.js
var React30 = __toESM(require_react());

// node_modules/antd/node_modules/@ant-design/icons/es/components/AntdIcon.js
var React29 = __toESM(require_react());
var import_classnames11 = __toESM(require_classnames());

// node_modules/antd/node_modules/@ant-design/icons/es/components/IconBase.js
var React28 = __toESM(require_react());

// node_modules/rc-util/es/Dom/shadow.js
function getRoot(ele) {
  var _ele$getRootNode;
  return ele === null || ele === void 0 || (_ele$getRootNode = ele.getRootNode) === null || _ele$getRootNode === void 0 ? void 0 : _ele$getRootNode.call(ele);
}
function inShadow(ele) {
  return getRoot(ele) instanceof ShadowRoot;
}
function getShadowRoot(ele) {
  return inShadow(ele) ? getRoot(ele) : null;
}

// node_modules/antd/node_modules/@ant-design/icons/es/utils.js
var import_react10 = __toESM(require_react());
function camelCase(input) {
  return input.replace(/-(.)/g, function(match, g) {
    return g.toUpperCase();
  });
}
function warning2(valid, message) {
  warning_default(valid, "[@ant-design/icons] ".concat(message));
}
function isIconDefinition(target) {
  return _typeof(target) === "object" && typeof target.name === "string" && typeof target.theme === "string" && (_typeof(target.icon) === "object" || typeof target.icon === "function");
}
function normalizeAttrs() {
  var attrs = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  return Object.keys(attrs).reduce(function(acc, key) {
    var val = attrs[key];
    switch (key) {
      case "class":
        acc.className = val;
        delete acc.class;
        break;
      default:
        delete acc[key];
        acc[camelCase(key)] = val;
    }
    return acc;
  }, {});
}
function generate2(node, key, rootProps) {
  if (!rootProps) {
    return import_react10.default.createElement(node.tag, _objectSpread2({
      key
    }, normalizeAttrs(node.attrs)), (node.children || []).map(function(child, index2) {
      return generate2(child, "".concat(key, "-").concat(node.tag, "-").concat(index2));
    }));
  }
  return import_react10.default.createElement(node.tag, _objectSpread2(_objectSpread2({
    key
  }, normalizeAttrs(node.attrs)), rootProps), (node.children || []).map(function(child, index2) {
    return generate2(child, "".concat(key, "-").concat(node.tag, "-").concat(index2));
  }));
}
function getSecondaryColor(primaryColor) {
  return generate(primaryColor)[0];
}
function normalizeTwoToneColors(twoToneColor) {
  if (!twoToneColor) {
    return [];
  }
  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor];
}
var svgBaseProps = {
  width: "1em",
  height: "1em",
  fill: "currentColor",
  "aria-hidden": "true",
  focusable: "false"
};
var iconStyles = "\n.anticon {\n  display: inline-flex;\n  align-items: center;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.anticon > * {\n  line-height: 1;\n}\n\n.anticon svg {\n  display: inline-block;\n}\n\n.anticon::before {\n  display: none;\n}\n\n.anticon .anticon-icon {\n  display: block;\n}\n\n.anticon[tabindex] {\n  cursor: pointer;\n}\n\n.anticon-spin::before,\n.anticon-spin {\n  display: inline-block;\n  -webkit-animation: loadingCircle 1s infinite linear;\n  animation: loadingCircle 1s infinite linear;\n}\n\n@-webkit-keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n";
var useInsertStyles = function useInsertStyles2(eleRef) {
  var _useContext = (0, import_react10.useContext)(Context_default), csp = _useContext.csp, prefixCls = _useContext.prefixCls, layer = _useContext.layer;
  var mergedStyleStr = iconStyles;
  if (prefixCls) {
    mergedStyleStr = mergedStyleStr.replace(/anticon/g, prefixCls);
  }
  if (layer) {
    mergedStyleStr = "@layer ".concat(layer, " {\n").concat(mergedStyleStr, "\n}");
  }
  (0, import_react10.useEffect)(function() {
    var ele = eleRef.current;
    var shadowRoot = getShadowRoot(ele);
    updateCSS(mergedStyleStr, "@ant-design-icons", {
      prepend: !layer,
      csp,
      attachTo: shadowRoot
    });
  }, []);
};

// node_modules/antd/node_modules/@ant-design/icons/es/components/IconBase.js
var _excluded3 = ["icon", "className", "onClick", "style", "primaryColor", "secondaryColor"];
var twoToneColorPalette = {
  primaryColor: "#333",
  secondaryColor: "#E6E6E6",
  calculated: false
};
function setTwoToneColors(_ref) {
  var primaryColor = _ref.primaryColor, secondaryColor = _ref.secondaryColor;
  twoToneColorPalette.primaryColor = primaryColor;
  twoToneColorPalette.secondaryColor = secondaryColor || getSecondaryColor(primaryColor);
  twoToneColorPalette.calculated = !!secondaryColor;
}
function getTwoToneColors() {
  return _objectSpread2({}, twoToneColorPalette);
}
var IconBase = function IconBase2(props) {
  var icon = props.icon, className = props.className, onClick = props.onClick, style2 = props.style, primaryColor = props.primaryColor, secondaryColor = props.secondaryColor, restProps = _objectWithoutProperties(props, _excluded3);
  var svgRef = React28.useRef();
  var colors = twoToneColorPalette;
  if (primaryColor) {
    colors = {
      primaryColor,
      secondaryColor: secondaryColor || getSecondaryColor(primaryColor)
    };
  }
  useInsertStyles(svgRef);
  warning2(isIconDefinition(icon), "icon should be icon definiton, but got ".concat(icon));
  if (!isIconDefinition(icon)) {
    return null;
  }
  var target = icon;
  if (target && typeof target.icon === "function") {
    target = _objectSpread2(_objectSpread2({}, target), {}, {
      icon: target.icon(colors.primaryColor, colors.secondaryColor)
    });
  }
  return generate2(target.icon, "svg-".concat(target.name), _objectSpread2(_objectSpread2({
    className,
    onClick,
    style: style2,
    "data-icon": target.name,
    width: "1em",
    height: "1em",
    fill: "currentColor",
    "aria-hidden": "true"
  }, restProps), {}, {
    ref: svgRef
  }));
};
IconBase.displayName = "IconReact";
IconBase.getTwoToneColors = getTwoToneColors;
IconBase.setTwoToneColors = setTwoToneColors;
var IconBase_default = IconBase;

// node_modules/antd/node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js
function setTwoToneColor(twoToneColor) {
  var _normalizeTwoToneColo = normalizeTwoToneColors(twoToneColor), _normalizeTwoToneColo2 = _slicedToArray(_normalizeTwoToneColo, 2), primaryColor = _normalizeTwoToneColo2[0], secondaryColor = _normalizeTwoToneColo2[1];
  return IconBase_default.setTwoToneColors({
    primaryColor,
    secondaryColor
  });
}
function getTwoToneColor() {
  var colors = IconBase_default.getTwoToneColors();
  if (!colors.calculated) {
    return colors.primaryColor;
  }
  return [colors.primaryColor, colors.secondaryColor];
}

// node_modules/antd/node_modules/@ant-design/icons/es/components/AntdIcon.js
var _excluded4 = ["className", "icon", "spin", "rotate", "tabIndex", "onClick", "twoToneColor"];
setTwoToneColor(blue.primary);
var Icon = React29.forwardRef(function(props, ref) {
  var className = props.className, icon = props.icon, spin = props.spin, rotate = props.rotate, tabIndex = props.tabIndex, onClick = props.onClick, twoToneColor = props.twoToneColor, restProps = _objectWithoutProperties(props, _excluded4);
  var _React$useContext = React29.useContext(Context_default), _React$useContext$pre = _React$useContext.prefixCls, prefixCls = _React$useContext$pre === void 0 ? "anticon" : _React$useContext$pre, rootClassName = _React$useContext.rootClassName;
  var classString = (0, import_classnames11.default)(rootClassName, prefixCls, _defineProperty(_defineProperty({}, "".concat(prefixCls, "-").concat(icon.name), !!icon.name), "".concat(prefixCls, "-spin"), !!spin || icon.name === "loading"), className);
  var iconTabIndex = tabIndex;
  if (iconTabIndex === void 0 && onClick) {
    iconTabIndex = -1;
  }
  var svgStyle = rotate ? {
    msTransform: "rotate(".concat(rotate, "deg)"),
    transform: "rotate(".concat(rotate, "deg)")
  } : void 0;
  var _normalizeTwoToneColo = normalizeTwoToneColors(twoToneColor), _normalizeTwoToneColo2 = _slicedToArray(_normalizeTwoToneColo, 2), primaryColor = _normalizeTwoToneColo2[0], secondaryColor = _normalizeTwoToneColo2[1];
  return React29.createElement("span", _extends({
    role: "img",
    "aria-label": icon.name
  }, restProps, {
    ref,
    tabIndex: iconTabIndex,
    onClick,
    className: classString
  }), React29.createElement(IconBase_default, {
    icon,
    primaryColor,
    secondaryColor,
    style: svgStyle
  }));
});
Icon.displayName = "AntdIcon";
Icon.getTwoToneColor = getTwoToneColor;
Icon.setTwoToneColor = setTwoToneColor;
var AntdIcon_default = Icon;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/CloseOutlined.js
var CloseOutlined = function CloseOutlined2(props, ref) {
  return React30.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: CloseOutlined_default
  }));
};
var RefIcon = React30.forwardRef(CloseOutlined);
if (true) {
  RefIcon.displayName = "CloseOutlined";
}
var CloseOutlined_default2 = RefIcon;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js
var React31 = __toESM(require_react());
var EllipsisOutlined = function EllipsisOutlined2(props, ref) {
  return React31.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: EllipsisOutlined_default
  }));
};
var RefIcon2 = React31.forwardRef(EllipsisOutlined);
if (true) {
  RefIcon2.displayName = "EllipsisOutlined";
}
var EllipsisOutlined_default2 = RefIcon2;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/PlusOutlined.js
var React32 = __toESM(require_react());
var PlusOutlined = function PlusOutlined2(props, ref) {
  return React32.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: PlusOutlined_default
  }));
};
var RefIcon3 = React32.forwardRef(PlusOutlined);
if (true) {
  RefIcon3.displayName = "PlusOutlined";
}
var PlusOutlined_default2 = RefIcon3;

// node_modules/antd/es/tabs/index.js
var import_classnames33 = __toESM(require_classnames());

// node_modules/rc-tabs/es/Tabs.js
var import_classnames32 = __toESM(require_classnames());

// node_modules/rc-util/es/isMobile.js
var isMobile_default = function() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  var agent = navigator.userAgent || navigator.vendor || window.opera;
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(agent === null || agent === void 0 ? void 0 : agent.substr(0, 4));
};

// node_modules/rc-tabs/es/Tabs.js
var React93 = __toESM(require_react());
var import_react26 = __toESM(require_react());

// node_modules/rc-tabs/es/TabContext.js
var import_react11 = __toESM(require_react());
var TabContext_default = (0, import_react11.createContext)(null);

// node_modules/rc-tabs/es/TabNavList/Wrapper.js
var React91 = __toESM(require_react());

// node_modules/rc-tabs/es/TabNavList/index.js
var import_classnames29 = __toESM(require_classnames());

// node_modules/rc-resize-observer/es/index.js
var React37 = __toESM(require_react());

// node_modules/rc-util/es/Children/toArray.js
var import_react12 = __toESM(require_react());
function toArray(children) {
  var option = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var ret = [];
  import_react12.default.Children.forEach(children, function(child) {
    if ((child === void 0 || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if (isFragment(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}

// node_modules/rc-resize-observer/es/SingleObserver/index.js
var React36 = __toESM(require_react());

// node_modules/rc-resize-observer/es/Collection.js
var React34 = __toESM(require_react());
var CollectionContext = React34.createContext(null);
function Collection(_ref) {
  var children = _ref.children, onBatchResize = _ref.onBatchResize;
  var resizeIdRef = React34.useRef(0);
  var resizeInfosRef = React34.useRef([]);
  var onCollectionResize = React34.useContext(CollectionContext);
  var onResize2 = React34.useCallback(function(size, element, data) {
    resizeIdRef.current += 1;
    var currentId = resizeIdRef.current;
    resizeInfosRef.current.push({
      size,
      element,
      data
    });
    Promise.resolve().then(function() {
      if (currentId === resizeIdRef.current) {
        onBatchResize === null || onBatchResize === void 0 || onBatchResize(resizeInfosRef.current);
        resizeInfosRef.current = [];
      }
    });
    onCollectionResize === null || onCollectionResize === void 0 || onCollectionResize(size, element, data);
  }, [onBatchResize, onCollectionResize]);
  return React34.createElement(CollectionContext.Provider, {
    value: onResize2
  }, children);
}

// node_modules/resize-observer-polyfill/dist/ResizeObserver.es.js
var MapShim = function() {
  if (typeof Map !== "undefined") {
    return Map;
  }
  function getIndex(arr, key) {
    var result = -1;
    arr.some(function(entry, index2) {
      if (entry[0] === key) {
        result = index2;
        return true;
      }
      return false;
    });
    return result;
  }
  return (
    /** @class */
    function() {
      function class_1() {
        this.__entries__ = [];
      }
      Object.defineProperty(class_1.prototype, "size", {
        /**
         * @returns {boolean}
         */
        get: function() {
          return this.__entries__.length;
        },
        enumerable: true,
        configurable: true
      });
      class_1.prototype.get = function(key) {
        var index2 = getIndex(this.__entries__, key);
        var entry = this.__entries__[index2];
        return entry && entry[1];
      };
      class_1.prototype.set = function(key, value) {
        var index2 = getIndex(this.__entries__, key);
        if (~index2) {
          this.__entries__[index2][1] = value;
        } else {
          this.__entries__.push([key, value]);
        }
      };
      class_1.prototype.delete = function(key) {
        var entries = this.__entries__;
        var index2 = getIndex(entries, key);
        if (~index2) {
          entries.splice(index2, 1);
        }
      };
      class_1.prototype.has = function(key) {
        return !!~getIndex(this.__entries__, key);
      };
      class_1.prototype.clear = function() {
        this.__entries__.splice(0);
      };
      class_1.prototype.forEach = function(callback, ctx) {
        if (ctx === void 0) {
          ctx = null;
        }
        for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
          var entry = _a[_i];
          callback.call(ctx, entry[1], entry[0]);
        }
      };
      return class_1;
    }()
  );
}();
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && window.document === document;
var global$1 = function() {
  if (typeof global !== "undefined" && global.Math === Math) {
    return global;
  }
  if (typeof self !== "undefined" && self.Math === Math) {
    return self;
  }
  if (typeof window !== "undefined" && window.Math === Math) {
    return window;
  }
  return Function("return this")();
}();
var requestAnimationFrame$1 = function() {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame.bind(global$1);
  }
  return function(callback) {
    return setTimeout(function() {
      return callback(Date.now());
    }, 1e3 / 60);
  };
}();
var trailingTimeout = 2;
function throttle(callback, delay) {
  var leadingCall = false, trailingCall = false, lastCallTime = 0;
  function resolvePending() {
    if (leadingCall) {
      leadingCall = false;
      callback();
    }
    if (trailingCall) {
      proxy();
    }
  }
  function timeoutCallback() {
    requestAnimationFrame$1(resolvePending);
  }
  function proxy() {
    var timeStamp = Date.now();
    if (leadingCall) {
      if (timeStamp - lastCallTime < trailingTimeout) {
        return;
      }
      trailingCall = true;
    } else {
      leadingCall = true;
      trailingCall = false;
      setTimeout(timeoutCallback, delay);
    }
    lastCallTime = timeStamp;
  }
  return proxy;
}
var REFRESH_DELAY = 20;
var transitionKeys = ["top", "right", "bottom", "left", "width", "height", "size", "weight"];
var mutationObserverSupported = typeof MutationObserver !== "undefined";
var ResizeObserverController = (
  /** @class */
  function() {
    function ResizeObserverController2() {
      this.connected_ = false;
      this.mutationEventsAdded_ = false;
      this.mutationsObserver_ = null;
      this.observers_ = [];
      this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
      this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }
    ResizeObserverController2.prototype.addObserver = function(observer) {
      if (!~this.observers_.indexOf(observer)) {
        this.observers_.push(observer);
      }
      if (!this.connected_) {
        this.connect_();
      }
    };
    ResizeObserverController2.prototype.removeObserver = function(observer) {
      var observers2 = this.observers_;
      var index2 = observers2.indexOf(observer);
      if (~index2) {
        observers2.splice(index2, 1);
      }
      if (!observers2.length && this.connected_) {
        this.disconnect_();
      }
    };
    ResizeObserverController2.prototype.refresh = function() {
      var changesDetected = this.updateObservers_();
      if (changesDetected) {
        this.refresh();
      }
    };
    ResizeObserverController2.prototype.updateObservers_ = function() {
      var activeObservers = this.observers_.filter(function(observer) {
        return observer.gatherActive(), observer.hasActive();
      });
      activeObservers.forEach(function(observer) {
        return observer.broadcastActive();
      });
      return activeObservers.length > 0;
    };
    ResizeObserverController2.prototype.connect_ = function() {
      if (!isBrowser || this.connected_) {
        return;
      }
      document.addEventListener("transitionend", this.onTransitionEnd_);
      window.addEventListener("resize", this.refresh);
      if (mutationObserverSupported) {
        this.mutationsObserver_ = new MutationObserver(this.refresh);
        this.mutationsObserver_.observe(document, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      } else {
        document.addEventListener("DOMSubtreeModified", this.refresh);
        this.mutationEventsAdded_ = true;
      }
      this.connected_ = true;
    };
    ResizeObserverController2.prototype.disconnect_ = function() {
      if (!isBrowser || !this.connected_) {
        return;
      }
      document.removeEventListener("transitionend", this.onTransitionEnd_);
      window.removeEventListener("resize", this.refresh);
      if (this.mutationsObserver_) {
        this.mutationsObserver_.disconnect();
      }
      if (this.mutationEventsAdded_) {
        document.removeEventListener("DOMSubtreeModified", this.refresh);
      }
      this.mutationsObserver_ = null;
      this.mutationEventsAdded_ = false;
      this.connected_ = false;
    };
    ResizeObserverController2.prototype.onTransitionEnd_ = function(_a) {
      var _b = _a.propertyName, propertyName = _b === void 0 ? "" : _b;
      var isReflowProperty = transitionKeys.some(function(key) {
        return !!~propertyName.indexOf(key);
      });
      if (isReflowProperty) {
        this.refresh();
      }
    };
    ResizeObserverController2.getInstance = function() {
      if (!this.instance_) {
        this.instance_ = new ResizeObserverController2();
      }
      return this.instance_;
    };
    ResizeObserverController2.instance_ = null;
    return ResizeObserverController2;
  }()
);
var defineConfigurable = function(target, props) {
  for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
    var key = _a[_i];
    Object.defineProperty(target, key, {
      value: props[key],
      enumerable: false,
      writable: false,
      configurable: true
    });
  }
  return target;
};
var getWindowOf = function(target) {
  var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
  return ownerGlobal || global$1;
};
var emptyRect = createRectInit(0, 0, 0, 0);
function toFloat(value) {
  return parseFloat(value) || 0;
}
function getBordersSize(styles) {
  var positions = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    positions[_i - 1] = arguments[_i];
  }
  return positions.reduce(function(size, position) {
    var value = styles["border-" + position + "-width"];
    return size + toFloat(value);
  }, 0);
}
function getPaddings(styles) {
  var positions = ["top", "right", "bottom", "left"];
  var paddings = {};
  for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
    var position = positions_1[_i];
    var value = styles["padding-" + position];
    paddings[position] = toFloat(value);
  }
  return paddings;
}
function getSVGContentRect(target) {
  var bbox = target.getBBox();
  return createRectInit(0, 0, bbox.width, bbox.height);
}
function getHTMLElementContentRect(target) {
  var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
  if (!clientWidth && !clientHeight) {
    return emptyRect;
  }
  var styles = getWindowOf(target).getComputedStyle(target);
  var paddings = getPaddings(styles);
  var horizPad = paddings.left + paddings.right;
  var vertPad = paddings.top + paddings.bottom;
  var width = toFloat(styles.width), height = toFloat(styles.height);
  if (styles.boxSizing === "border-box") {
    if (Math.round(width + horizPad) !== clientWidth) {
      width -= getBordersSize(styles, "left", "right") + horizPad;
    }
    if (Math.round(height + vertPad) !== clientHeight) {
      height -= getBordersSize(styles, "top", "bottom") + vertPad;
    }
  }
  if (!isDocumentElement(target)) {
    var vertScrollbar = Math.round(width + horizPad) - clientWidth;
    var horizScrollbar = Math.round(height + vertPad) - clientHeight;
    if (Math.abs(vertScrollbar) !== 1) {
      width -= vertScrollbar;
    }
    if (Math.abs(horizScrollbar) !== 1) {
      height -= horizScrollbar;
    }
  }
  return createRectInit(paddings.left, paddings.top, width, height);
}
var isSVGGraphicsElement = function() {
  if (typeof SVGGraphicsElement !== "undefined") {
    return function(target) {
      return target instanceof getWindowOf(target).SVGGraphicsElement;
    };
  }
  return function(target) {
    return target instanceof getWindowOf(target).SVGElement && typeof target.getBBox === "function";
  };
}();
function isDocumentElement(target) {
  return target === getWindowOf(target).document.documentElement;
}
function getContentRect(target) {
  if (!isBrowser) {
    return emptyRect;
  }
  if (isSVGGraphicsElement(target)) {
    return getSVGContentRect(target);
  }
  return getHTMLElementContentRect(target);
}
function createReadOnlyRect(_a) {
  var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
  var Constr = typeof DOMRectReadOnly !== "undefined" ? DOMRectReadOnly : Object;
  var rect = Object.create(Constr.prototype);
  defineConfigurable(rect, {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: height + y,
    left: x
  });
  return rect;
}
function createRectInit(x, y, width, height) {
  return { x, y, width, height };
}
var ResizeObservation = (
  /** @class */
  function() {
    function ResizeObservation2(target) {
      this.broadcastWidth = 0;
      this.broadcastHeight = 0;
      this.contentRect_ = createRectInit(0, 0, 0, 0);
      this.target = target;
    }
    ResizeObservation2.prototype.isActive = function() {
      var rect = getContentRect(this.target);
      this.contentRect_ = rect;
      return rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight;
    };
    ResizeObservation2.prototype.broadcastRect = function() {
      var rect = this.contentRect_;
      this.broadcastWidth = rect.width;
      this.broadcastHeight = rect.height;
      return rect;
    };
    return ResizeObservation2;
  }()
);
var ResizeObserverEntry = (
  /** @class */
  /* @__PURE__ */ function() {
    function ResizeObserverEntry2(target, rectInit) {
      var contentRect = createReadOnlyRect(rectInit);
      defineConfigurable(this, { target, contentRect });
    }
    return ResizeObserverEntry2;
  }()
);
var ResizeObserverSPI = (
  /** @class */
  function() {
    function ResizeObserverSPI2(callback, controller, callbackCtx) {
      this.activeObservations_ = [];
      this.observations_ = new MapShim();
      if (typeof callback !== "function") {
        throw new TypeError("The callback provided as parameter 1 is not a function.");
      }
      this.callback_ = callback;
      this.controller_ = controller;
      this.callbackCtx_ = callbackCtx;
    }
    ResizeObserverSPI2.prototype.observe = function(target) {
      if (!arguments.length) {
        throw new TypeError("1 argument required, but only 0 present.");
      }
      if (typeof Element === "undefined" || !(Element instanceof Object)) {
        return;
      }
      if (!(target instanceof getWindowOf(target).Element)) {
        throw new TypeError('parameter 1 is not of type "Element".');
      }
      var observations = this.observations_;
      if (observations.has(target)) {
        return;
      }
      observations.set(target, new ResizeObservation(target));
      this.controller_.addObserver(this);
      this.controller_.refresh();
    };
    ResizeObserverSPI2.prototype.unobserve = function(target) {
      if (!arguments.length) {
        throw new TypeError("1 argument required, but only 0 present.");
      }
      if (typeof Element === "undefined" || !(Element instanceof Object)) {
        return;
      }
      if (!(target instanceof getWindowOf(target).Element)) {
        throw new TypeError('parameter 1 is not of type "Element".');
      }
      var observations = this.observations_;
      if (!observations.has(target)) {
        return;
      }
      observations.delete(target);
      if (!observations.size) {
        this.controller_.removeObserver(this);
      }
    };
    ResizeObserverSPI2.prototype.disconnect = function() {
      this.clearActive();
      this.observations_.clear();
      this.controller_.removeObserver(this);
    };
    ResizeObserverSPI2.prototype.gatherActive = function() {
      var _this = this;
      this.clearActive();
      this.observations_.forEach(function(observation) {
        if (observation.isActive()) {
          _this.activeObservations_.push(observation);
        }
      });
    };
    ResizeObserverSPI2.prototype.broadcastActive = function() {
      if (!this.hasActive()) {
        return;
      }
      var ctx = this.callbackCtx_;
      var entries = this.activeObservations_.map(function(observation) {
        return new ResizeObserverEntry(observation.target, observation.broadcastRect());
      });
      this.callback_.call(ctx, entries, ctx);
      this.clearActive();
    };
    ResizeObserverSPI2.prototype.clearActive = function() {
      this.activeObservations_.splice(0);
    };
    ResizeObserverSPI2.prototype.hasActive = function() {
      return this.activeObservations_.length > 0;
    };
    return ResizeObserverSPI2;
  }()
);
var observers = typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : new MapShim();
var ResizeObserver = (
  /** @class */
  /* @__PURE__ */ function() {
    function ResizeObserver3(callback) {
      if (!(this instanceof ResizeObserver3)) {
        throw new TypeError("Cannot call a class as a function.");
      }
      if (!arguments.length) {
        throw new TypeError("1 argument required, but only 0 present.");
      }
      var controller = ResizeObserverController.getInstance();
      var observer = new ResizeObserverSPI(callback, controller, this);
      observers.set(this, observer);
    }
    return ResizeObserver3;
  }()
);
[
  "observe",
  "unobserve",
  "disconnect"
].forEach(function(method4) {
  ResizeObserver.prototype[method4] = function() {
    var _a;
    return (_a = observers.get(this))[method4].apply(_a, arguments);
  };
});
var index = function() {
  if (typeof global$1.ResizeObserver !== "undefined") {
    return global$1.ResizeObserver;
  }
  return ResizeObserver;
}();
var ResizeObserver_es_default = index;

// node_modules/rc-resize-observer/es/utils/observerUtil.js
var elementListeners = /* @__PURE__ */ new Map();
function onResize(entities) {
  entities.forEach(function(entity) {
    var _elementListeners$get;
    var target = entity.target;
    (_elementListeners$get = elementListeners.get(target)) === null || _elementListeners$get === void 0 || _elementListeners$get.forEach(function(listener) {
      return listener(target);
    });
  });
}
var resizeObserver = new ResizeObserver_es_default(onResize);
function observe(element, callback) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, /* @__PURE__ */ new Set());
    resizeObserver.observe(element);
  }
  elementListeners.get(element).add(callback);
}
function unobserve(element, callback) {
  if (elementListeners.has(element)) {
    elementListeners.get(element).delete(callback);
    if (!elementListeners.get(element).size) {
      resizeObserver.unobserve(element);
      elementListeners.delete(element);
    }
  }
}

// node_modules/rc-resize-observer/es/SingleObserver/DomWrapper.js
var React35 = __toESM(require_react());
var DomWrapper2 = function(_React$Component) {
  _inherits(DomWrapper3, _React$Component);
  var _super = _createSuper(DomWrapper3);
  function DomWrapper3() {
    _classCallCheck(this, DomWrapper3);
    return _super.apply(this, arguments);
  }
  _createClass(DomWrapper3, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper3;
}(React35.Component);

// node_modules/rc-resize-observer/es/SingleObserver/index.js
function SingleObserver(props, ref) {
  var children = props.children, disabled = props.disabled;
  var elementRef = React36.useRef(null);
  var wrapperRef = React36.useRef(null);
  var onCollectionResize = React36.useContext(CollectionContext);
  var isRenderProps = typeof children === "function";
  var mergedChildren = isRenderProps ? children(elementRef) : children;
  var sizeRef = React36.useRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1
  });
  var canRef = !isRenderProps && React36.isValidElement(mergedChildren) && supportRef(mergedChildren);
  var originRef = canRef ? getNodeRef(mergedChildren) : null;
  var mergedRef = useComposeRef(originRef, elementRef);
  var getDom = function getDom2() {
    var _elementRef$current;
    return findDOMNode(elementRef.current) || // Support `nativeElement` format
    (elementRef.current && _typeof(elementRef.current) === "object" ? findDOMNode((_elementRef$current = elementRef.current) === null || _elementRef$current === void 0 ? void 0 : _elementRef$current.nativeElement) : null) || findDOMNode(wrapperRef.current);
  };
  React36.useImperativeHandle(ref, function() {
    return getDom();
  });
  var propsRef = React36.useRef(props);
  propsRef.current = props;
  var onInternalResize = React36.useCallback(function(target) {
    var _propsRef$current = propsRef.current, onResize2 = _propsRef$current.onResize, data = _propsRef$current.data;
    var _target$getBoundingCl = target.getBoundingClientRect(), width = _target$getBoundingCl.width, height = _target$getBoundingCl.height;
    var offsetWidth = target.offsetWidth, offsetHeight = target.offsetHeight;
    var fixedWidth = Math.floor(width);
    var fixedHeight = Math.floor(height);
    if (sizeRef.current.width !== fixedWidth || sizeRef.current.height !== fixedHeight || sizeRef.current.offsetWidth !== offsetWidth || sizeRef.current.offsetHeight !== offsetHeight) {
      var size = {
        width: fixedWidth,
        height: fixedHeight,
        offsetWidth,
        offsetHeight
      };
      sizeRef.current = size;
      var mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
      var mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;
      var sizeInfo = _objectSpread2(_objectSpread2({}, size), {}, {
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight
      });
      onCollectionResize === null || onCollectionResize === void 0 || onCollectionResize(sizeInfo, target, data);
      if (onResize2) {
        Promise.resolve().then(function() {
          onResize2(sizeInfo, target);
        });
      }
    }
  }, []);
  React36.useEffect(function() {
    var currentElement = getDom();
    if (currentElement && !disabled) {
      observe(currentElement, onInternalResize);
    }
    return function() {
      return unobserve(currentElement, onInternalResize);
    };
  }, [elementRef.current, disabled]);
  return React36.createElement(DomWrapper2, {
    ref: wrapperRef
  }, canRef ? React36.cloneElement(mergedChildren, {
    ref: mergedRef
  }) : mergedChildren);
}
var RefSingleObserver = React36.forwardRef(SingleObserver);
if (true) {
  RefSingleObserver.displayName = "SingleObserver";
}
var SingleObserver_default = RefSingleObserver;

// node_modules/rc-resize-observer/es/index.js
var INTERNAL_PREFIX_KEY = "rc-observer-key";
function ResizeObserver2(props, ref) {
  var children = props.children;
  var childNodes = typeof children === "function" ? [children] : toArray(children);
  if (true) {
    if (childNodes.length > 1) {
      warning(false, "Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.");
    } else if (childNodes.length === 0) {
      warning(false, "`children` of ResizeObserver is empty. Nothing is in observe.");
    }
  }
  return childNodes.map(function(child, index2) {
    var key = (child === null || child === void 0 ? void 0 : child.key) || "".concat(INTERNAL_PREFIX_KEY, "-").concat(index2);
    return React37.createElement(SingleObserver_default, _extends({}, props, {
      key,
      ref: index2 === 0 ? ref : void 0
    }), child);
  });
}
var RefResizeObserver = React37.forwardRef(ResizeObserver2);
if (true) {
  RefResizeObserver.displayName = "ResizeObserver";
}
RefResizeObserver.Collection = Collection;
var es_default2 = RefResizeObserver;

// node_modules/rc-tabs/es/TabNavList/index.js
var React89 = __toESM(require_react());
var import_react25 = __toESM(require_react());

// node_modules/rc-tabs/es/hooks/useIndicator.js
var import_react13 = __toESM(require_react());
var useIndicator = function useIndicator2(options) {
  var activeTabOffset = options.activeTabOffset, horizontal = options.horizontal, rtl = options.rtl, _options$indicator = options.indicator, indicator = _options$indicator === void 0 ? {} : _options$indicator;
  var size = indicator.size, _indicator$align = indicator.align, align = _indicator$align === void 0 ? "center" : _indicator$align;
  var _useState = (0, import_react13.useState)(), _useState2 = _slicedToArray(_useState, 2), inkStyle = _useState2[0], setInkStyle = _useState2[1];
  var inkBarRafRef = (0, import_react13.useRef)();
  var getLength = import_react13.default.useCallback(function(origin) {
    if (typeof size === "function") {
      return size(origin);
    }
    if (typeof size === "number") {
      return size;
    }
    return origin;
  }, [size]);
  function cleanInkBarRaf() {
    raf_default.cancel(inkBarRafRef.current);
  }
  (0, import_react13.useEffect)(function() {
    var newInkStyle = {};
    if (activeTabOffset) {
      if (horizontal) {
        newInkStyle.width = getLength(activeTabOffset.width);
        var key = rtl ? "right" : "left";
        if (align === "start") {
          newInkStyle[key] = activeTabOffset[key];
        }
        if (align === "center") {
          newInkStyle[key] = activeTabOffset[key] + activeTabOffset.width / 2;
          newInkStyle.transform = rtl ? "translateX(50%)" : "translateX(-50%)";
        }
        if (align === "end") {
          newInkStyle[key] = activeTabOffset[key] + activeTabOffset.width;
          newInkStyle.transform = "translateX(-100%)";
        }
      } else {
        newInkStyle.height = getLength(activeTabOffset.height);
        if (align === "start") {
          newInkStyle.top = activeTabOffset.top;
        }
        if (align === "center") {
          newInkStyle.top = activeTabOffset.top + activeTabOffset.height / 2;
          newInkStyle.transform = "translateY(-50%)";
        }
        if (align === "end") {
          newInkStyle.top = activeTabOffset.top + activeTabOffset.height;
          newInkStyle.transform = "translateY(-100%)";
        }
      }
    }
    cleanInkBarRaf();
    inkBarRafRef.current = raf_default(function() {
      var isEqual = inkStyle && newInkStyle && Object.keys(newInkStyle).every(function(key2) {
        var newValue = newInkStyle[key2];
        var oldValue = inkStyle[key2];
        return typeof newValue === "number" && typeof oldValue === "number" ? Math.round(newValue) === Math.round(oldValue) : newValue === oldValue;
      });
      if (!isEqual) {
        setInkStyle(newInkStyle);
      }
    });
    return cleanInkBarRaf;
  }, [JSON.stringify(activeTabOffset), horizontal, rtl, align, getLength]);
  return {
    style: inkStyle
  };
};
var useIndicator_default = useIndicator;

// node_modules/rc-tabs/es/hooks/useOffsets.js
var import_react14 = __toESM(require_react());
var DEFAULT_SIZE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0
};
function useOffsets(tabs, tabSizes, holderScrollWidth) {
  return (0, import_react14.useMemo)(function() {
    var _tabs$;
    var map = /* @__PURE__ */ new Map();
    var lastOffset = tabSizes.get((_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.key) || DEFAULT_SIZE;
    var rightOffset = lastOffset.left + lastOffset.width;
    for (var i = 0; i < tabs.length; i += 1) {
      var key = tabs[i].key;
      var data = tabSizes.get(key);
      if (!data) {
        var _tabs;
        data = tabSizes.get((_tabs = tabs[i - 1]) === null || _tabs === void 0 ? void 0 : _tabs.key) || DEFAULT_SIZE;
      }
      var entity = map.get(key) || _objectSpread2({}, data);
      entity.right = rightOffset - entity.left - entity.width;
      map.set(key, entity);
    }
    return map;
  }, [tabs.map(function(tab) {
    return tab.key;
  }).join("_"), tabSizes, holderScrollWidth]);
}

// node_modules/rc-tabs/es/hooks/useSyncState.js
var React39 = __toESM(require_react());
function useSyncState2(defaultState, onChange) {
  var stateRef = React39.useRef(defaultState);
  var _React$useState = React39.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), forceUpdate = _React$useState2[1];
  function setState(updater) {
    var newValue = typeof updater === "function" ? updater(stateRef.current) : updater;
    if (newValue !== stateRef.current) {
      onChange(newValue, stateRef.current);
    }
    stateRef.current = newValue;
    forceUpdate({});
  }
  return [stateRef.current, setState];
}

// node_modules/rc-tabs/es/hooks/useTouchMove.js
var React40 = __toESM(require_react());
var import_react15 = __toESM(require_react());
var MIN_SWIPE_DISTANCE = 0.1;
var STOP_SWIPE_DISTANCE = 0.01;
var REFRESH_INTERVAL = 20;
var SPEED_OFF_MULTIPLE = Math.pow(0.995, REFRESH_INTERVAL);
function useTouchMove(ref, onOffset) {
  var _useState = (0, import_react15.useState)(), _useState2 = _slicedToArray(_useState, 2), touchPosition = _useState2[0], setTouchPosition = _useState2[1];
  var _useState3 = (0, import_react15.useState)(0), _useState4 = _slicedToArray(_useState3, 2), lastTimestamp = _useState4[0], setLastTimestamp = _useState4[1];
  var _useState5 = (0, import_react15.useState)(0), _useState6 = _slicedToArray(_useState5, 2), lastTimeDiff = _useState6[0], setLastTimeDiff = _useState6[1];
  var _useState7 = (0, import_react15.useState)(), _useState8 = _slicedToArray(_useState7, 2), lastOffset = _useState8[0], setLastOffset = _useState8[1];
  var motionRef = (0, import_react15.useRef)();
  function onTouchStart(e) {
    var _e$touches$ = e.touches[0], screenX = _e$touches$.screenX, screenY = _e$touches$.screenY;
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    window.clearInterval(motionRef.current);
  }
  function onTouchMove(e) {
    if (!touchPosition) return;
    var _e$touches$2 = e.touches[0], screenX = _e$touches$2.screenX, screenY = _e$touches$2.screenY;
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    var offsetX = screenX - touchPosition.x;
    var offsetY = screenY - touchPosition.y;
    onOffset(offsetX, offsetY);
    var now = Date.now();
    setLastTimestamp(now);
    setLastTimeDiff(now - lastTimestamp);
    setLastOffset({
      x: offsetX,
      y: offsetY
    });
  }
  function onTouchEnd() {
    if (!touchPosition) return;
    setTouchPosition(null);
    setLastOffset(null);
    if (lastOffset) {
      var distanceX = lastOffset.x / lastTimeDiff;
      var distanceY = lastOffset.y / lastTimeDiff;
      var absX = Math.abs(distanceX);
      var absY = Math.abs(distanceY);
      if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE) return;
      var currentX = distanceX;
      var currentY = distanceY;
      motionRef.current = window.setInterval(function() {
        if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
          window.clearInterval(motionRef.current);
          return;
        }
        currentX *= SPEED_OFF_MULTIPLE;
        currentY *= SPEED_OFF_MULTIPLE;
        onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL);
      }, REFRESH_INTERVAL);
    }
  }
  var lastWheelDirectionRef = (0, import_react15.useRef)();
  function onWheel(e) {
    var deltaX = e.deltaX, deltaY = e.deltaY;
    var mixed = 0;
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);
    if (absX === absY) {
      mixed = lastWheelDirectionRef.current === "x" ? deltaX : deltaY;
    } else if (absX > absY) {
      mixed = deltaX;
      lastWheelDirectionRef.current = "x";
    } else {
      mixed = deltaY;
      lastWheelDirectionRef.current = "y";
    }
    if (onOffset(-mixed, -mixed)) {
      e.preventDefault();
    }
  }
  var touchEventsRef = (0, import_react15.useRef)(null);
  touchEventsRef.current = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onWheel
  };
  React40.useEffect(function() {
    function onProxyTouchStart(e) {
      touchEventsRef.current.onTouchStart(e);
    }
    function onProxyTouchMove(e) {
      touchEventsRef.current.onTouchMove(e);
    }
    function onProxyTouchEnd(e) {
      touchEventsRef.current.onTouchEnd(e);
    }
    function onProxyWheel(e) {
      touchEventsRef.current.onWheel(e);
    }
    document.addEventListener("touchmove", onProxyTouchMove, {
      passive: false
    });
    document.addEventListener("touchend", onProxyTouchEnd, {
      passive: true
    });
    ref.current.addEventListener("touchstart", onProxyTouchStart, {
      passive: true
    });
    ref.current.addEventListener("wheel", onProxyWheel, {
      passive: false
    });
    return function() {
      document.removeEventListener("touchmove", onProxyTouchMove);
      document.removeEventListener("touchend", onProxyTouchEnd);
    };
  }, []);
}

// node_modules/rc-tabs/es/hooks/useUpdate.js
var import_react16 = __toESM(require_react());
function useUpdate(callback) {
  var _useState = (0, import_react16.useState)(0), _useState2 = _slicedToArray(_useState, 2), count = _useState2[0], setCount = _useState2[1];
  var effectRef = (0, import_react16.useRef)(0);
  var callbackRef = (0, import_react16.useRef)();
  callbackRef.current = callback;
  useLayoutUpdateEffect(function() {
    var _callbackRef$current;
    (_callbackRef$current = callbackRef.current) === null || _callbackRef$current === void 0 || _callbackRef$current.call(callbackRef);
  }, [count]);
  return function() {
    if (effectRef.current !== count) {
      return;
    }
    effectRef.current += 1;
    setCount(effectRef.current);
  };
}
function useUpdateState(defaultState) {
  var batchRef = (0, import_react16.useRef)([]);
  var _useState3 = (0, import_react16.useState)({}), _useState4 = _slicedToArray(_useState3, 2), forceUpdate = _useState4[1];
  var state = (0, import_react16.useRef)(typeof defaultState === "function" ? defaultState() : defaultState);
  var flushUpdate = useUpdate(function() {
    var current = state.current;
    batchRef.current.forEach(function(callback) {
      current = callback(current);
    });
    batchRef.current = [];
    state.current = current;
    forceUpdate({});
  });
  function updater(callback) {
    batchRef.current.push(callback);
    flushUpdate();
  }
  return [state.current, updater];
}

// node_modules/rc-tabs/es/hooks/useVisibleRange.js
var import_react17 = __toESM(require_react());
var DEFAULT_SIZE2 = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0
};
function useVisibleRange(tabOffsets, visibleTabContentValue, transform, tabContentSizeValue, addNodeSizeValue, operationNodeSizeValue, _ref) {
  var tabs = _ref.tabs, tabPosition = _ref.tabPosition, rtl = _ref.rtl;
  var charUnit;
  var position;
  var transformSize;
  if (["top", "bottom"].includes(tabPosition)) {
    charUnit = "width";
    position = rtl ? "right" : "left";
    transformSize = Math.abs(transform);
  } else {
    charUnit = "height";
    position = "top";
    transformSize = -transform;
  }
  return (0, import_react17.useMemo)(function() {
    if (!tabs.length) {
      return [0, 0];
    }
    var len = tabs.length;
    var endIndex = len;
    for (var i = 0; i < len; i += 1) {
      var offset = tabOffsets.get(tabs[i].key) || DEFAULT_SIZE2;
      if (Math.floor(offset[position] + offset[charUnit]) > Math.floor(transformSize + visibleTabContentValue)) {
        endIndex = i - 1;
        break;
      }
    }
    var startIndex = 0;
    for (var _i = len - 1; _i >= 0; _i -= 1) {
      var _offset = tabOffsets.get(tabs[_i].key) || DEFAULT_SIZE2;
      if (_offset[position] < transformSize) {
        startIndex = _i + 1;
        break;
      }
    }
    return startIndex >= endIndex ? [0, 0] : [startIndex, endIndex];
  }, [tabOffsets, visibleTabContentValue, tabContentSizeValue, addNodeSizeValue, operationNodeSizeValue, transformSize, tabPosition, tabs.map(function(tab) {
    return tab.key;
  }).join("_"), rtl]);
}

// node_modules/rc-tabs/es/util.js
function stringify(obj) {
  var tgt;
  if (obj instanceof Map) {
    tgt = {};
    obj.forEach(function(v, k) {
      tgt[k] = v;
    });
  } else {
    tgt = obj;
  }
  return JSON.stringify(tgt);
}
var RC_TABS_DOUBLE_QUOTE = "TABS_DQ";
function genDataNodeKey(key) {
  return String(key).replace(/"/g, RC_TABS_DOUBLE_QUOTE);
}
function getRemovable(closable, closeIcon, editable, disabled) {
  if (
    // Only editable tabs can be removed
    !editable || // Tabs cannot be removed when disabled
    disabled || // closable is false
    closable === false || // If closable is undefined, the remove button should be hidden when closeIcon is null or false
    closable === void 0 && (closeIcon === false || closeIcon === null)
  ) {
    return false;
  }
  return true;
}

// node_modules/rc-tabs/es/TabNavList/AddButton.js
var React41 = __toESM(require_react());
var AddButton = React41.forwardRef(function(props, ref) {
  var prefixCls = props.prefixCls, editable = props.editable, locale5 = props.locale, style2 = props.style;
  if (!editable || editable.showAdd === false) {
    return null;
  }
  return React41.createElement("button", {
    ref,
    type: "button",
    className: "".concat(prefixCls, "-nav-add"),
    style: style2,
    "aria-label": (locale5 === null || locale5 === void 0 ? void 0 : locale5.addAriaLabel) || "Add tab",
    onClick: function onClick(event) {
      editable.onEdit("add", {
        event
      });
    }
  }, editable.addIcon || "+");
});
var AddButton_default = AddButton;

// node_modules/rc-tabs/es/TabNavList/ExtraContent.js
var React42 = __toESM(require_react());
var ExtraContent = React42.forwardRef(function(props, ref) {
  var position = props.position, prefixCls = props.prefixCls, extra = props.extra;
  if (!extra) {
    return null;
  }
  var content;
  var assertExtra = {};
  if (_typeof(extra) === "object" && !React42.isValidElement(extra)) {
    assertExtra = extra;
  } else {
    assertExtra.right = extra;
  }
  if (position === "right") {
    content = assertExtra.right;
  }
  if (position === "left") {
    content = assertExtra.left;
  }
  return content ? React42.createElement("div", {
    className: "".concat(prefixCls, "-extra-content"),
    ref
  }, content) : null;
});
if (true) {
  ExtraContent.displayName = "ExtraContent";
}
var ExtraContent_default = ExtraContent;

// node_modules/rc-tabs/es/TabNavList/OperationNode.js
var import_classnames27 = __toESM(require_classnames());

// node_modules/@rc-component/portal/es/Portal.js
var React46 = __toESM(require_react());
var import_react_dom2 = __toESM(require_react_dom());

// node_modules/@rc-component/portal/es/Context.js
var React43 = __toESM(require_react());
var OrderContext = React43.createContext(null);
var Context_default2 = OrderContext;

// node_modules/@rc-component/portal/es/useDom.js
var React44 = __toESM(require_react());
var EMPTY_LIST = [];
function useDom(render, debug) {
  var _React$useState = React44.useState(function() {
    if (!canUseDom()) {
      return null;
    }
    var defaultEle = document.createElement("div");
    if (debug) {
      defaultEle.setAttribute("data-debug", debug);
    }
    return defaultEle;
  }), _React$useState2 = _slicedToArray(_React$useState, 1), ele = _React$useState2[0];
  var appendedRef = React44.useRef(false);
  var queueCreate = React44.useContext(Context_default2);
  var _React$useState3 = React44.useState(EMPTY_LIST), _React$useState4 = _slicedToArray(_React$useState3, 2), queue = _React$useState4[0], setQueue = _React$useState4[1];
  var mergedQueueCreate = queueCreate || (appendedRef.current ? void 0 : function(appendFn) {
    setQueue(function(origin) {
      var newQueue = [appendFn].concat(_toConsumableArray(origin));
      return newQueue;
    });
  });
  function append() {
    if (!ele.parentElement) {
      document.body.appendChild(ele);
    }
    appendedRef.current = true;
  }
  function cleanup2() {
    var _ele$parentElement;
    (_ele$parentElement = ele.parentElement) === null || _ele$parentElement === void 0 ? void 0 : _ele$parentElement.removeChild(ele);
    appendedRef.current = false;
  }
  useLayoutEffect_default(function() {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup2();
    }
    return cleanup2;
  }, [render]);
  useLayoutEffect_default(function() {
    if (queue.length) {
      queue.forEach(function(appendFn) {
        return appendFn();
      });
      setQueue(EMPTY_LIST);
    }
  }, [queue]);
  return [ele, mergedQueueCreate];
}

// node_modules/@rc-component/portal/es/useScrollLocker.js
var React45 = __toESM(require_react());

// node_modules/rc-util/es/getScrollBarSize.js
var cached;
function measureScrollbarSize(ele) {
  var randomId = "rc-scrollbar-measure-".concat(Math.random().toString(36).substring(7));
  var measureEle = document.createElement("div");
  measureEle.id = randomId;
  var measureStyle = measureEle.style;
  measureStyle.position = "absolute";
  measureStyle.left = "0";
  measureStyle.top = "0";
  measureStyle.width = "100px";
  measureStyle.height = "100px";
  measureStyle.overflow = "scroll";
  var fallbackWidth;
  var fallbackHeight;
  if (ele) {
    var targetStyle = getComputedStyle(ele);
    measureStyle.scrollbarColor = targetStyle.scrollbarColor;
    measureStyle.scrollbarWidth = targetStyle.scrollbarWidth;
    var webkitScrollbarStyle = getComputedStyle(ele, "::-webkit-scrollbar");
    var width = parseInt(webkitScrollbarStyle.width, 10);
    var height = parseInt(webkitScrollbarStyle.height, 10);
    try {
      var widthStyle = width ? "width: ".concat(webkitScrollbarStyle.width, ";") : "";
      var heightStyle = height ? "height: ".concat(webkitScrollbarStyle.height, ";") : "";
      updateCSS("\n#".concat(randomId, "::-webkit-scrollbar {\n").concat(widthStyle, "\n").concat(heightStyle, "\n}"), randomId);
    } catch (e) {
      console.error(e);
      fallbackWidth = width;
      fallbackHeight = height;
    }
  }
  document.body.appendChild(measureEle);
  var scrollWidth = ele && fallbackWidth && !isNaN(fallbackWidth) ? fallbackWidth : measureEle.offsetWidth - measureEle.clientWidth;
  var scrollHeight = ele && fallbackHeight && !isNaN(fallbackHeight) ? fallbackHeight : measureEle.offsetHeight - measureEle.clientHeight;
  document.body.removeChild(measureEle);
  removeCSS(randomId);
  return {
    width: scrollWidth,
    height: scrollHeight
  };
}
function getScrollBarSize(fresh) {
  if (typeof document === "undefined") {
    return 0;
  }
  if (fresh || cached === void 0) {
    cached = measureScrollbarSize();
  }
  return cached.width;
}
function getTargetScrollBarSize(target) {
  if (typeof document === "undefined" || !target || !(target instanceof Element)) {
    return {
      width: 0,
      height: 0
    };
  }
  return measureScrollbarSize(target);
}

// node_modules/@rc-component/portal/es/util.js
function isBodyOverflowing() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) && window.innerWidth > document.body.offsetWidth;
}

// node_modules/@rc-component/portal/es/useScrollLocker.js
var UNIQUE_ID = "rc-util-locker-".concat(Date.now());
var uuid = 0;
function useScrollLocker(lock) {
  var mergedLock = !!lock;
  var _React$useState = React45.useState(function() {
    uuid += 1;
    return "".concat(UNIQUE_ID, "_").concat(uuid);
  }), _React$useState2 = _slicedToArray(_React$useState, 1), id = _React$useState2[0];
  useLayoutEffect_default(function() {
    if (mergedLock) {
      var scrollbarSize = getTargetScrollBarSize(document.body).width;
      var isOverflow = isBodyOverflowing();
      updateCSS("\nhtml body {\n  overflow-y: hidden;\n  ".concat(isOverflow ? "width: calc(100% - ".concat(scrollbarSize, "px);") : "", "\n}"), id);
    } else {
      removeCSS(id);
    }
    return function() {
      removeCSS(id);
    };
  }, [mergedLock, id]);
}

// node_modules/@rc-component/portal/es/mock.js
var inline = false;
function inlineMock(nextInline) {
  if (typeof nextInline === "boolean") {
    inline = nextInline;
  }
  return inline;
}

// node_modules/@rc-component/portal/es/Portal.js
var getPortalContainer = function getPortalContainer2(getContainer) {
  if (getContainer === false) {
    return false;
  }
  if (!canUseDom() || !getContainer) {
    return null;
  }
  if (typeof getContainer === "string") {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === "function") {
    return getContainer();
  }
  return getContainer;
};
var Portal = React46.forwardRef(function(props, ref) {
  var open = props.open, autoLock = props.autoLock, getContainer = props.getContainer, debug = props.debug, _props$autoDestroy = props.autoDestroy, autoDestroy = _props$autoDestroy === void 0 ? true : _props$autoDestroy, children = props.children;
  var _React$useState = React46.useState(open), _React$useState2 = _slicedToArray(_React$useState, 2), shouldRender = _React$useState2[0], setShouldRender = _React$useState2[1];
  var mergedRender = shouldRender || open;
  if (true) {
    warning_default(canUseDom() || !open, "Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.");
  }
  React46.useEffect(function() {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);
  var _React$useState3 = React46.useState(function() {
    return getPortalContainer(getContainer);
  }), _React$useState4 = _slicedToArray(_React$useState3, 2), innerContainer = _React$useState4[0], setInnerContainer = _React$useState4[1];
  React46.useEffect(function() {
    var customizeContainer = getPortalContainer(getContainer);
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  });
  var _useDom = useDom(mergedRender && !innerContainer, debug), _useDom2 = _slicedToArray(_useDom, 2), defaultContainer = _useDom2[0], queueCreate = _useDom2[1];
  var mergedContainer = innerContainer !== null && innerContainer !== void 0 ? innerContainer : defaultContainer;
  useScrollLocker(autoLock && open && canUseDom() && (mergedContainer === defaultContainer || mergedContainer === document.body));
  var childRef = null;
  if (children && supportRef(children) && ref) {
    var _ref = children;
    childRef = _ref.ref;
  }
  var mergedRef = useComposeRef(childRef, ref);
  if (!mergedRender || !canUseDom() || innerContainer === void 0) {
    return null;
  }
  var renderInline = mergedContainer === false || inlineMock();
  var reffedChildren = children;
  if (ref) {
    reffedChildren = React46.cloneElement(children, {
      ref: mergedRef
    });
  }
  return React46.createElement(Context_default2.Provider, {
    value: queueCreate
  }, renderInline ? reffedChildren : (0, import_react_dom2.createPortal)(reffedChildren, mergedContainer));
});
if (true) {
  Portal.displayName = "Portal";
}
var Portal_default = Portal;

// node_modules/@rc-component/portal/es/index.js
var es_default3 = Portal_default;

// node_modules/@rc-component/trigger/es/index.js
var import_classnames15 = __toESM(require_classnames());

// node_modules/rc-util/es/hooks/useId.js
var React47 = __toESM(require_react());
function getUseId() {
  var fullClone2 = _objectSpread2({}, React47);
  return fullClone2.useId;
}
var uuid2 = 0;
var useOriginId = getUseId();
var useId_default = useOriginId ? (
  // Use React `useId`
  function useId2(id) {
    var reactId = useOriginId();
    if (id) {
      return id;
    }
    if (false) {
      return "test-id";
    }
    return reactId;
  }
) : (
  // Use compatible of `useId`
  function useCompatId(id) {
    var _React$useState = React47.useState("ssr-id"), _React$useState2 = _slicedToArray(_React$useState, 2), innerId = _React$useState2[0], setInnerId = _React$useState2[1];
    React47.useEffect(function() {
      var nextId = uuid2;
      uuid2 += 1;
      setInnerId("rc_unique_".concat(nextId));
    }, []);
    if (id) {
      return id;
    }
    if (false) {
      return "test-id";
    }
    return innerId;
  }
);

// node_modules/@rc-component/trigger/es/index.js
var React57 = __toESM(require_react());

// node_modules/@rc-component/trigger/es/Popup/index.js
var import_classnames14 = __toESM(require_classnames());
var React51 = __toESM(require_react());

// node_modules/@rc-component/trigger/es/Popup/Arrow.js
var import_classnames12 = __toESM(require_classnames());
var React48 = __toESM(require_react());
function Arrow(props) {
  var prefixCls = props.prefixCls, align = props.align, arrow = props.arrow, arrowPos = props.arrowPos;
  var _ref = arrow || {}, className = _ref.className, content = _ref.content;
  var _arrowPos$x = arrowPos.x, x = _arrowPos$x === void 0 ? 0 : _arrowPos$x, _arrowPos$y = arrowPos.y, y = _arrowPos$y === void 0 ? 0 : _arrowPos$y;
  var arrowRef = React48.useRef();
  if (!align || !align.points) {
    return null;
  }
  var alignStyle = {
    position: "absolute"
  };
  if (align.autoArrow !== false) {
    var popupPoints = align.points[0];
    var targetPoints = align.points[1];
    var popupTB = popupPoints[0];
    var popupLR = popupPoints[1];
    var targetTB = targetPoints[0];
    var targetLR = targetPoints[1];
    if (popupTB === targetTB || !["t", "b"].includes(popupTB)) {
      alignStyle.top = y;
    } else if (popupTB === "t") {
      alignStyle.top = 0;
    } else {
      alignStyle.bottom = 0;
    }
    if (popupLR === targetLR || !["l", "r"].includes(popupLR)) {
      alignStyle.left = x;
    } else if (popupLR === "l") {
      alignStyle.left = 0;
    } else {
      alignStyle.right = 0;
    }
  }
  return React48.createElement("div", {
    ref: arrowRef,
    className: (0, import_classnames12.default)("".concat(prefixCls, "-arrow"), className),
    style: alignStyle
  }, content);
}

// node_modules/@rc-component/trigger/es/Popup/Mask.js
var import_classnames13 = __toESM(require_classnames());
var React49 = __toESM(require_react());
function Mask(props) {
  var prefixCls = props.prefixCls, open = props.open, zIndex = props.zIndex, mask = props.mask, motion2 = props.motion;
  if (!mask) {
    return null;
  }
  return React49.createElement(es_default, _extends({}, motion2, {
    motionAppear: true,
    visible: open,
    removeOnLeave: true
  }), function(_ref) {
    var className = _ref.className;
    return React49.createElement("div", {
      style: {
        zIndex
      },
      className: (0, import_classnames13.default)("".concat(prefixCls, "-mask"), className)
    });
  });
}

// node_modules/@rc-component/trigger/es/Popup/PopupContent.js
var React50 = __toESM(require_react());
var PopupContent = React50.memo(function(_ref) {
  var children = _ref.children;
  return children;
}, function(_, next) {
  return next.cache;
});
if (true) {
  PopupContent.displayName = "PopupContent";
}
var PopupContent_default = PopupContent;

// node_modules/@rc-component/trigger/es/Popup/index.js
var Popup = React51.forwardRef(function(props, ref) {
  var popup = props.popup, className = props.className, prefixCls = props.prefixCls, style2 = props.style, target = props.target, _onVisibleChanged = props.onVisibleChanged, open = props.open, keepDom = props.keepDom, fresh = props.fresh, onClick = props.onClick, mask = props.mask, arrow = props.arrow, arrowPos = props.arrowPos, align = props.align, motion2 = props.motion, maskMotion = props.maskMotion, forceRender = props.forceRender, getPopupContainer = props.getPopupContainer, autoDestroy = props.autoDestroy, Portal2 = props.portal, zIndex = props.zIndex, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onPointerEnter = props.onPointerEnter, onPointerDownCapture = props.onPointerDownCapture, ready = props.ready, offsetX = props.offsetX, offsetY = props.offsetY, offsetR = props.offsetR, offsetB = props.offsetB, onAlign = props.onAlign, onPrepare = props.onPrepare, stretch = props.stretch, targetWidth = props.targetWidth, targetHeight = props.targetHeight;
  var childNode = typeof popup === "function" ? popup() : popup;
  var isNodeVisible = open || keepDom;
  var getPopupContainerNeedParams = (getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.length) > 0;
  var _React$useState = React51.useState(!getPopupContainer || !getPopupContainerNeedParams), _React$useState2 = _slicedToArray(_React$useState, 2), show = _React$useState2[0], setShow = _React$useState2[1];
  useLayoutEffect_default(function() {
    if (!show && getPopupContainerNeedParams && target) {
      setShow(true);
    }
  }, [show, getPopupContainerNeedParams, target]);
  if (!show) {
    return null;
  }
  var AUTO = "auto";
  var offsetStyle = {
    left: "-1000vw",
    top: "-1000vh",
    right: AUTO,
    bottom: AUTO
  };
  if (ready || !open) {
    var _experimental;
    var points = align.points;
    var dynamicInset = align.dynamicInset || ((_experimental = align._experimental) === null || _experimental === void 0 ? void 0 : _experimental.dynamicInset);
    var alignRight = dynamicInset && points[0][1] === "r";
    var alignBottom = dynamicInset && points[0][0] === "b";
    if (alignRight) {
      offsetStyle.right = offsetR;
      offsetStyle.left = AUTO;
    } else {
      offsetStyle.left = offsetX;
      offsetStyle.right = AUTO;
    }
    if (alignBottom) {
      offsetStyle.bottom = offsetB;
      offsetStyle.top = AUTO;
    } else {
      offsetStyle.top = offsetY;
      offsetStyle.bottom = AUTO;
    }
  }
  var miscStyle = {};
  if (stretch) {
    if (stretch.includes("height") && targetHeight) {
      miscStyle.height = targetHeight;
    } else if (stretch.includes("minHeight") && targetHeight) {
      miscStyle.minHeight = targetHeight;
    }
    if (stretch.includes("width") && targetWidth) {
      miscStyle.width = targetWidth;
    } else if (stretch.includes("minWidth") && targetWidth) {
      miscStyle.minWidth = targetWidth;
    }
  }
  if (!open) {
    miscStyle.pointerEvents = "none";
  }
  return React51.createElement(Portal2, {
    open: forceRender || isNodeVisible,
    getContainer: getPopupContainer && function() {
      return getPopupContainer(target);
    },
    autoDestroy
  }, React51.createElement(Mask, {
    prefixCls,
    open,
    zIndex,
    mask,
    motion: maskMotion
  }), React51.createElement(es_default2, {
    onResize: onAlign,
    disabled: !open
  }, function(resizeObserverRef) {
    return React51.createElement(es_default, _extends({
      motionAppear: true,
      motionEnter: true,
      motionLeave: true,
      removeOnLeave: false,
      forceRender,
      leavedClassName: "".concat(prefixCls, "-hidden")
    }, motion2, {
      onAppearPrepare: onPrepare,
      onEnterPrepare: onPrepare,
      visible: open,
      onVisibleChanged: function onVisibleChanged(nextVisible) {
        var _motion$onVisibleChan;
        motion2 === null || motion2 === void 0 || (_motion$onVisibleChan = motion2.onVisibleChanged) === null || _motion$onVisibleChan === void 0 || _motion$onVisibleChan.call(motion2, nextVisible);
        _onVisibleChanged(nextVisible);
      }
    }), function(_ref, motionRef) {
      var motionClassName = _ref.className, motionStyle = _ref.style;
      var cls = (0, import_classnames14.default)(prefixCls, motionClassName, className);
      return React51.createElement("div", {
        ref: composeRef(resizeObserverRef, ref, motionRef),
        className: cls,
        style: _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
          "--arrow-x": "".concat(arrowPos.x || 0, "px"),
          "--arrow-y": "".concat(arrowPos.y || 0, "px")
        }, offsetStyle), miscStyle), motionStyle), {}, {
          boxSizing: "border-box",
          zIndex
        }, style2),
        onMouseEnter,
        onMouseLeave,
        onPointerEnter,
        onClick,
        onPointerDownCapture
      }, arrow && React51.createElement(Arrow, {
        prefixCls,
        arrow,
        arrowPos,
        align
      }), React51.createElement(PopupContent_default, {
        cache: !open && !fresh
      }, childNode));
    });
  }));
});
if (true) {
  Popup.displayName = "Popup";
}
var Popup_default = Popup;

// node_modules/@rc-component/trigger/es/TriggerWrapper.js
var React52 = __toESM(require_react());
var TriggerWrapper = React52.forwardRef(function(props, ref) {
  var children = props.children, getTriggerDOMNode = props.getTriggerDOMNode;
  var canUseRef = supportRef(children);
  var setRef = React52.useCallback(function(node) {
    fillRef(ref, getTriggerDOMNode ? getTriggerDOMNode(node) : node);
  }, [getTriggerDOMNode]);
  var mergedRef = useComposeRef(setRef, getNodeRef(children));
  return canUseRef ? React52.cloneElement(children, {
    ref: mergedRef
  }) : children;
});
if (true) {
  TriggerWrapper.displayName = "TriggerWrapper";
}
var TriggerWrapper_default = TriggerWrapper;

// node_modules/@rc-component/trigger/es/context.js
var React53 = __toESM(require_react());
var TriggerContext = React53.createContext(null);
var context_default2 = TriggerContext;

// node_modules/@rc-component/trigger/es/hooks/useAction.js
var React54 = __toESM(require_react());
function toArray2(val) {
  return val ? Array.isArray(val) ? val : [val] : [];
}
function useAction(mobile, action, showAction, hideAction) {
  return React54.useMemo(function() {
    var mergedShowAction = toArray2(showAction !== null && showAction !== void 0 ? showAction : action);
    var mergedHideAction = toArray2(hideAction !== null && hideAction !== void 0 ? hideAction : action);
    var showActionSet = new Set(mergedShowAction);
    var hideActionSet = new Set(mergedHideAction);
    if (mobile) {
      if (showActionSet.has("hover")) {
        showActionSet.delete("hover");
        showActionSet.add("click");
      }
      if (hideActionSet.has("hover")) {
        hideActionSet.delete("hover");
        hideActionSet.add("click");
      }
    }
    return [showActionSet, hideActionSet];
  }, [mobile, action, showAction, hideAction]);
}

// node_modules/rc-util/es/Dom/isVisible.js
var isVisible_default = function(element) {
  if (!element) {
    return false;
  }
  if (element instanceof Element) {
    if (element.offsetParent) {
      return true;
    }
    if (element.getBBox) {
      var _getBBox = element.getBBox(), width = _getBBox.width, height = _getBBox.height;
      if (width || height) {
        return true;
      }
    }
    if (element.getBoundingClientRect) {
      var _element$getBoundingC = element.getBoundingClientRect(), _width = _element$getBoundingC.width, _height = _element$getBoundingC.height;
      if (_width || _height) {
        return true;
      }
    }
  }
  return false;
};

// node_modules/@rc-component/trigger/es/hooks/useAlign.js
var React55 = __toESM(require_react());

// node_modules/@rc-component/trigger/es/util.js
function isPointsEq() {
  var a1 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  var a2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var isAlignPoint = arguments.length > 2 ? arguments[2] : void 0;
  if (isAlignPoint) {
    return a1[0] === a2[0];
  }
  return a1[0] === a2[0] && a1[1] === a2[1];
}
function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
  var points = align.points;
  var placements3 = Object.keys(builtinPlacements);
  for (var i = 0; i < placements3.length; i += 1) {
    var _builtinPlacements$pl;
    var placement = placements3[i];
    if (isPointsEq((_builtinPlacements$pl = builtinPlacements[placement]) === null || _builtinPlacements$pl === void 0 ? void 0 : _builtinPlacements$pl.points, points, isAlignPoint)) {
      return "".concat(prefixCls, "-placement-").concat(placement);
    }
  }
  return "";
}
function getMotion(prefixCls, motion2, animation, transitionName) {
  if (motion2) {
    return motion2;
  }
  if (animation) {
    return {
      motionName: "".concat(prefixCls, "-").concat(animation)
    };
  }
  if (transitionName) {
    return {
      motionName: transitionName
    };
  }
  return null;
}
function getWin(ele) {
  return ele.ownerDocument.defaultView;
}
function collectScroller(ele) {
  var scrollerList = [];
  var current = ele === null || ele === void 0 ? void 0 : ele.parentElement;
  var scrollStyle = ["hidden", "scroll", "clip", "auto"];
  while (current) {
    var _getWin$getComputedSt = getWin(current).getComputedStyle(current), overflowX = _getWin$getComputedSt.overflowX, overflowY = _getWin$getComputedSt.overflowY, overflow = _getWin$getComputedSt.overflow;
    if ([overflowX, overflowY, overflow].some(function(o) {
      return scrollStyle.includes(o);
    })) {
      scrollerList.push(current);
    }
    current = current.parentElement;
  }
  return scrollerList;
}
function toNum(num) {
  var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  return Number.isNaN(num) ? defaultValue : num;
}
function getPxValue(val) {
  return toNum(parseFloat(val), 0);
}
function getVisibleArea(initArea, scrollerList) {
  var visibleArea = _objectSpread2({}, initArea);
  (scrollerList || []).forEach(function(ele) {
    if (ele instanceof HTMLBodyElement || ele instanceof HTMLHtmlElement) {
      return;
    }
    var _getWin$getComputedSt2 = getWin(ele).getComputedStyle(ele), overflow = _getWin$getComputedSt2.overflow, overflowClipMargin = _getWin$getComputedSt2.overflowClipMargin, borderTopWidth = _getWin$getComputedSt2.borderTopWidth, borderBottomWidth = _getWin$getComputedSt2.borderBottomWidth, borderLeftWidth = _getWin$getComputedSt2.borderLeftWidth, borderRightWidth = _getWin$getComputedSt2.borderRightWidth;
    var eleRect = ele.getBoundingClientRect();
    var eleOutHeight = ele.offsetHeight, eleInnerHeight = ele.clientHeight, eleOutWidth = ele.offsetWidth, eleInnerWidth = ele.clientWidth;
    var borderTopNum = getPxValue(borderTopWidth);
    var borderBottomNum = getPxValue(borderBottomWidth);
    var borderLeftNum = getPxValue(borderLeftWidth);
    var borderRightNum = getPxValue(borderRightWidth);
    var scaleX = toNum(Math.round(eleRect.width / eleOutWidth * 1e3) / 1e3);
    var scaleY = toNum(Math.round(eleRect.height / eleOutHeight * 1e3) / 1e3);
    var eleScrollWidth = (eleOutWidth - eleInnerWidth - borderLeftNum - borderRightNum) * scaleX;
    var eleScrollHeight = (eleOutHeight - eleInnerHeight - borderTopNum - borderBottomNum) * scaleY;
    var scaledBorderTopWidth = borderTopNum * scaleY;
    var scaledBorderBottomWidth = borderBottomNum * scaleY;
    var scaledBorderLeftWidth = borderLeftNum * scaleX;
    var scaledBorderRightWidth = borderRightNum * scaleX;
    var clipMarginWidth = 0;
    var clipMarginHeight = 0;
    if (overflow === "clip") {
      var clipNum = getPxValue(overflowClipMargin);
      clipMarginWidth = clipNum * scaleX;
      clipMarginHeight = clipNum * scaleY;
    }
    var eleLeft = eleRect.x + scaledBorderLeftWidth - clipMarginWidth;
    var eleTop = eleRect.y + scaledBorderTopWidth - clipMarginHeight;
    var eleRight = eleLeft + eleRect.width + 2 * clipMarginWidth - scaledBorderLeftWidth - scaledBorderRightWidth - eleScrollWidth;
    var eleBottom = eleTop + eleRect.height + 2 * clipMarginHeight - scaledBorderTopWidth - scaledBorderBottomWidth - eleScrollHeight;
    visibleArea.left = Math.max(visibleArea.left, eleLeft);
    visibleArea.top = Math.max(visibleArea.top, eleTop);
    visibleArea.right = Math.min(visibleArea.right, eleRight);
    visibleArea.bottom = Math.min(visibleArea.bottom, eleBottom);
  });
  return visibleArea;
}

// node_modules/@rc-component/trigger/es/hooks/useAlign.js
function getUnitOffset(size) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var offsetStr = "".concat(offset);
  var cells = offsetStr.match(/^(.*)\%$/);
  if (cells) {
    return size * (parseFloat(cells[1]) / 100);
  }
  return parseFloat(offsetStr);
}
function getNumberOffset(rect, offset) {
  var _ref = offset || [], _ref2 = _slicedToArray(_ref, 2), offsetX = _ref2[0], offsetY = _ref2[1];
  return [getUnitOffset(rect.width, offsetX), getUnitOffset(rect.height, offsetY)];
}
function splitPoints() {
  var points = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
  return [points[0], points[1]];
}
function getAlignPoint(rect, points) {
  var topBottom = points[0];
  var leftRight = points[1];
  var x;
  var y;
  if (topBottom === "t") {
    y = rect.y;
  } else if (topBottom === "b") {
    y = rect.y + rect.height;
  } else {
    y = rect.y + rect.height / 2;
  }
  if (leftRight === "l") {
    x = rect.x;
  } else if (leftRight === "r") {
    x = rect.x + rect.width;
  } else {
    x = rect.x + rect.width / 2;
  }
  return {
    x,
    y
  };
}
function reversePoints(points, index2) {
  var reverseMap = {
    t: "b",
    b: "t",
    l: "r",
    r: "l"
  };
  return points.map(function(point, i) {
    if (i === index2) {
      return reverseMap[point] || "c";
    }
    return point;
  }).join("");
}
function useAlign(open, popupEle, target, placement, builtinPlacements, popupAlign, onPopupAlign) {
  var _React$useState = React55.useState({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    offsetR: 0,
    offsetB: 0,
    arrowX: 0,
    arrowY: 0,
    scaleX: 1,
    scaleY: 1,
    align: builtinPlacements[placement] || {}
  }), _React$useState2 = _slicedToArray(_React$useState, 2), offsetInfo = _React$useState2[0], setOffsetInfo = _React$useState2[1];
  var alignCountRef = React55.useRef(0);
  var scrollerList = React55.useMemo(function() {
    if (!popupEle) {
      return [];
    }
    return collectScroller(popupEle);
  }, [popupEle]);
  var prevFlipRef = React55.useRef({});
  var resetFlipCache = function resetFlipCache2() {
    prevFlipRef.current = {};
  };
  if (!open) {
    resetFlipCache();
  }
  var onAlign = useEvent(function() {
    if (popupEle && target && open) {
      let getIntersectionVisibleArea = function(offsetX, offsetY) {
        var area = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : visibleArea;
        var l = popupRect.x + offsetX;
        var t = popupRect.y + offsetY;
        var r = l + popupWidth;
        var b = t + popupHeight;
        var visibleL = Math.max(l, area.left);
        var visibleT = Math.max(t, area.top);
        var visibleR = Math.min(r, area.right);
        var visibleB = Math.min(b, area.bottom);
        return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT));
      }, syncNextPopupPosition = function() {
        nextPopupY = popupRect.y + nextOffsetY;
        nextPopupBottom = nextPopupY + popupHeight;
        nextPopupX = popupRect.x + nextOffsetX;
        nextPopupRight = nextPopupX + popupWidth;
      };
      var _popupElement$parentE, _popupRect$x, _popupRect$y, _popupElement$parentE2;
      var popupElement = popupEle;
      var doc = popupElement.ownerDocument;
      var win = getWin(popupElement);
      var _win$getComputedStyle = win.getComputedStyle(popupElement), popupPosition = _win$getComputedStyle.position;
      var originLeft = popupElement.style.left;
      var originTop = popupElement.style.top;
      var originRight = popupElement.style.right;
      var originBottom = popupElement.style.bottom;
      var originOverflow = popupElement.style.overflow;
      var placementInfo = _objectSpread2(_objectSpread2({}, builtinPlacements[placement]), popupAlign);
      var placeholderElement = doc.createElement("div");
      (_popupElement$parentE = popupElement.parentElement) === null || _popupElement$parentE === void 0 || _popupElement$parentE.appendChild(placeholderElement);
      placeholderElement.style.left = "".concat(popupElement.offsetLeft, "px");
      placeholderElement.style.top = "".concat(popupElement.offsetTop, "px");
      placeholderElement.style.position = popupPosition;
      placeholderElement.style.height = "".concat(popupElement.offsetHeight, "px");
      placeholderElement.style.width = "".concat(popupElement.offsetWidth, "px");
      popupElement.style.left = "0";
      popupElement.style.top = "0";
      popupElement.style.right = "auto";
      popupElement.style.bottom = "auto";
      popupElement.style.overflow = "hidden";
      var targetRect;
      if (Array.isArray(target)) {
        targetRect = {
          x: target[0],
          y: target[1],
          width: 0,
          height: 0
        };
      } else {
        var _rect$x, _rect$y;
        var rect = target.getBoundingClientRect();
        rect.x = (_rect$x = rect.x) !== null && _rect$x !== void 0 ? _rect$x : rect.left;
        rect.y = (_rect$y = rect.y) !== null && _rect$y !== void 0 ? _rect$y : rect.top;
        targetRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      var popupRect = popupElement.getBoundingClientRect();
      var _win$getComputedStyle2 = win.getComputedStyle(popupElement), height = _win$getComputedStyle2.height, width = _win$getComputedStyle2.width;
      popupRect.x = (_popupRect$x = popupRect.x) !== null && _popupRect$x !== void 0 ? _popupRect$x : popupRect.left;
      popupRect.y = (_popupRect$y = popupRect.y) !== null && _popupRect$y !== void 0 ? _popupRect$y : popupRect.top;
      var _doc$documentElement = doc.documentElement, clientWidth = _doc$documentElement.clientWidth, clientHeight = _doc$documentElement.clientHeight, scrollWidth = _doc$documentElement.scrollWidth, scrollHeight = _doc$documentElement.scrollHeight, scrollTop = _doc$documentElement.scrollTop, scrollLeft = _doc$documentElement.scrollLeft;
      var popupHeight = popupRect.height;
      var popupWidth = popupRect.width;
      var targetHeight = targetRect.height;
      var targetWidth = targetRect.width;
      var visibleRegion = {
        left: 0,
        top: 0,
        right: clientWidth,
        bottom: clientHeight
      };
      var scrollRegion = {
        left: -scrollLeft,
        top: -scrollTop,
        right: scrollWidth - scrollLeft,
        bottom: scrollHeight - scrollTop
      };
      var htmlRegion = placementInfo.htmlRegion;
      var VISIBLE = "visible";
      var VISIBLE_FIRST = "visibleFirst";
      if (htmlRegion !== "scroll" && htmlRegion !== VISIBLE_FIRST) {
        htmlRegion = VISIBLE;
      }
      var isVisibleFirst = htmlRegion === VISIBLE_FIRST;
      var scrollRegionArea = getVisibleArea(scrollRegion, scrollerList);
      var visibleRegionArea = getVisibleArea(visibleRegion, scrollerList);
      var visibleArea = htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea;
      var adjustCheckVisibleArea = isVisibleFirst ? visibleRegionArea : visibleArea;
      popupElement.style.left = "auto";
      popupElement.style.top = "auto";
      popupElement.style.right = "0";
      popupElement.style.bottom = "0";
      var popupMirrorRect = popupElement.getBoundingClientRect();
      popupElement.style.left = originLeft;
      popupElement.style.top = originTop;
      popupElement.style.right = originRight;
      popupElement.style.bottom = originBottom;
      popupElement.style.overflow = originOverflow;
      (_popupElement$parentE2 = popupElement.parentElement) === null || _popupElement$parentE2 === void 0 || _popupElement$parentE2.removeChild(placeholderElement);
      var _scaleX = toNum(Math.round(popupWidth / parseFloat(width) * 1e3) / 1e3);
      var _scaleY = toNum(Math.round(popupHeight / parseFloat(height) * 1e3) / 1e3);
      if (_scaleX === 0 || _scaleY === 0 || isDOM(target) && !isVisible_default(target)) {
        return;
      }
      var offset = placementInfo.offset, targetOffset2 = placementInfo.targetOffset;
      var _getNumberOffset = getNumberOffset(popupRect, offset), _getNumberOffset2 = _slicedToArray(_getNumberOffset, 2), popupOffsetX = _getNumberOffset2[0], popupOffsetY = _getNumberOffset2[1];
      var _getNumberOffset3 = getNumberOffset(targetRect, targetOffset2), _getNumberOffset4 = _slicedToArray(_getNumberOffset3, 2), targetOffsetX = _getNumberOffset4[0], targetOffsetY = _getNumberOffset4[1];
      targetRect.x -= targetOffsetX;
      targetRect.y -= targetOffsetY;
      var _ref3 = placementInfo.points || [], _ref4 = _slicedToArray(_ref3, 2), popupPoint = _ref4[0], targetPoint = _ref4[1];
      var targetPoints = splitPoints(targetPoint);
      var popupPoints = splitPoints(popupPoint);
      var targetAlignPoint = getAlignPoint(targetRect, targetPoints);
      var popupAlignPoint = getAlignPoint(popupRect, popupPoints);
      var nextAlignInfo = _objectSpread2({}, placementInfo);
      var nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
      var nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;
      var originIntersectionVisibleArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY);
      var originIntersectionRecommendArea = getIntersectionVisibleArea(nextOffsetX, nextOffsetY, visibleRegionArea);
      var targetAlignPointTL = getAlignPoint(targetRect, ["t", "l"]);
      var popupAlignPointTL = getAlignPoint(popupRect, ["t", "l"]);
      var targetAlignPointBR = getAlignPoint(targetRect, ["b", "r"]);
      var popupAlignPointBR = getAlignPoint(popupRect, ["b", "r"]);
      var overflow = placementInfo.overflow || {};
      var adjustX = overflow.adjustX, adjustY = overflow.adjustY, shiftX = overflow.shiftX, shiftY = overflow.shiftY;
      var supportAdjust = function supportAdjust2(val) {
        if (typeof val === "boolean") {
          return val;
        }
        return val >= 0;
      };
      var nextPopupY;
      var nextPopupBottom;
      var nextPopupX;
      var nextPopupRight;
      syncNextPopupPosition();
      var needAdjustY = supportAdjust(adjustY);
      var sameTB = popupPoints[0] === targetPoints[0];
      if (needAdjustY && popupPoints[0] === "t" && (nextPopupBottom > adjustCheckVisibleArea.bottom || prevFlipRef.current.bt)) {
        var tmpNextOffsetY = nextOffsetY;
        if (sameTB) {
          tmpNextOffsetY -= popupHeight - targetHeight;
        } else {
          tmpNextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;
        }
        var newVisibleArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY);
        var newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY, visibleRegionArea);
        if (
          // Of course use larger one
          newVisibleArea > originIntersectionVisibleArea || newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
          newVisibleRecommendArea >= originIntersectionRecommendArea)
        ) {
          prevFlipRef.current.bt = true;
          nextOffsetY = tmpNextOffsetY;
          popupOffsetY = -popupOffsetY;
          nextAlignInfo.points = [reversePoints(popupPoints, 0), reversePoints(targetPoints, 0)];
        } else {
          prevFlipRef.current.bt = false;
        }
      }
      if (needAdjustY && popupPoints[0] === "b" && (nextPopupY < adjustCheckVisibleArea.top || prevFlipRef.current.tb)) {
        var _tmpNextOffsetY = nextOffsetY;
        if (sameTB) {
          _tmpNextOffsetY += popupHeight - targetHeight;
        } else {
          _tmpNextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;
        }
        var _newVisibleArea = getIntersectionVisibleArea(nextOffsetX, _tmpNextOffsetY);
        var _newVisibleRecommendArea = getIntersectionVisibleArea(nextOffsetX, _tmpNextOffsetY, visibleRegionArea);
        if (
          // Of course use larger one
          _newVisibleArea > originIntersectionVisibleArea || _newVisibleArea === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
          _newVisibleRecommendArea >= originIntersectionRecommendArea)
        ) {
          prevFlipRef.current.tb = true;
          nextOffsetY = _tmpNextOffsetY;
          popupOffsetY = -popupOffsetY;
          nextAlignInfo.points = [reversePoints(popupPoints, 0), reversePoints(targetPoints, 0)];
        } else {
          prevFlipRef.current.tb = false;
        }
      }
      var needAdjustX = supportAdjust(adjustX);
      var sameLR = popupPoints[1] === targetPoints[1];
      if (needAdjustX && popupPoints[1] === "l" && (nextPopupRight > adjustCheckVisibleArea.right || prevFlipRef.current.rl)) {
        var tmpNextOffsetX = nextOffsetX;
        if (sameLR) {
          tmpNextOffsetX -= popupWidth - targetWidth;
        } else {
          tmpNextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;
        }
        var _newVisibleArea2 = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY);
        var _newVisibleRecommendArea2 = getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY, visibleRegionArea);
        if (
          // Of course use larger one
          _newVisibleArea2 > originIntersectionVisibleArea || _newVisibleArea2 === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
          _newVisibleRecommendArea2 >= originIntersectionRecommendArea)
        ) {
          prevFlipRef.current.rl = true;
          nextOffsetX = tmpNextOffsetX;
          popupOffsetX = -popupOffsetX;
          nextAlignInfo.points = [reversePoints(popupPoints, 1), reversePoints(targetPoints, 1)];
        } else {
          prevFlipRef.current.rl = false;
        }
      }
      if (needAdjustX && popupPoints[1] === "r" && (nextPopupX < adjustCheckVisibleArea.left || prevFlipRef.current.lr)) {
        var _tmpNextOffsetX = nextOffsetX;
        if (sameLR) {
          _tmpNextOffsetX += popupWidth - targetWidth;
        } else {
          _tmpNextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;
        }
        var _newVisibleArea3 = getIntersectionVisibleArea(_tmpNextOffsetX, nextOffsetY);
        var _newVisibleRecommendArea3 = getIntersectionVisibleArea(_tmpNextOffsetX, nextOffsetY, visibleRegionArea);
        if (
          // Of course use larger one
          _newVisibleArea3 > originIntersectionVisibleArea || _newVisibleArea3 === originIntersectionVisibleArea && (!isVisibleFirst || // Choose recommend one
          _newVisibleRecommendArea3 >= originIntersectionRecommendArea)
        ) {
          prevFlipRef.current.lr = true;
          nextOffsetX = _tmpNextOffsetX;
          popupOffsetX = -popupOffsetX;
          nextAlignInfo.points = [reversePoints(popupPoints, 1), reversePoints(targetPoints, 1)];
        } else {
          prevFlipRef.current.lr = false;
        }
      }
      syncNextPopupPosition();
      var numShiftX = shiftX === true ? 0 : shiftX;
      if (typeof numShiftX === "number") {
        if (nextPopupX < visibleRegionArea.left) {
          nextOffsetX -= nextPopupX - visibleRegionArea.left - popupOffsetX;
          if (targetRect.x + targetWidth < visibleRegionArea.left + numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.left + targetWidth - numShiftX;
          }
        }
        if (nextPopupRight > visibleRegionArea.right) {
          nextOffsetX -= nextPopupRight - visibleRegionArea.right - popupOffsetX;
          if (targetRect.x > visibleRegionArea.right - numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX;
          }
        }
      }
      var numShiftY = shiftY === true ? 0 : shiftY;
      if (typeof numShiftY === "number") {
        if (nextPopupY < visibleRegionArea.top) {
          nextOffsetY -= nextPopupY - visibleRegionArea.top - popupOffsetY;
          if (targetRect.y + targetHeight < visibleRegionArea.top + numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.top + targetHeight - numShiftY;
          }
        }
        if (nextPopupBottom > visibleRegionArea.bottom) {
          nextOffsetY -= nextPopupBottom - visibleRegionArea.bottom - popupOffsetY;
          if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY;
          }
        }
      }
      var popupLeft = popupRect.x + nextOffsetX;
      var popupRight = popupLeft + popupWidth;
      var popupTop = popupRect.y + nextOffsetY;
      var popupBottom = popupTop + popupHeight;
      var targetLeft = targetRect.x;
      var targetRight = targetLeft + targetWidth;
      var targetTop = targetRect.y;
      var targetBottom = targetTop + targetHeight;
      var maxLeft = Math.max(popupLeft, targetLeft);
      var minRight = Math.min(popupRight, targetRight);
      var xCenter = (maxLeft + minRight) / 2;
      var nextArrowX = xCenter - popupLeft;
      var maxTop = Math.max(popupTop, targetTop);
      var minBottom = Math.min(popupBottom, targetBottom);
      var yCenter = (maxTop + minBottom) / 2;
      var nextArrowY = yCenter - popupTop;
      onPopupAlign === null || onPopupAlign === void 0 || onPopupAlign(popupEle, nextAlignInfo);
      var offsetX4Right = popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width);
      var offsetY4Bottom = popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height);
      if (_scaleX === 1) {
        nextOffsetX = Math.round(nextOffsetX);
        offsetX4Right = Math.round(offsetX4Right);
      }
      if (_scaleY === 1) {
        nextOffsetY = Math.round(nextOffsetY);
        offsetY4Bottom = Math.round(offsetY4Bottom);
      }
      var nextOffsetInfo = {
        ready: true,
        offsetX: nextOffsetX / _scaleX,
        offsetY: nextOffsetY / _scaleY,
        offsetR: offsetX4Right / _scaleX,
        offsetB: offsetY4Bottom / _scaleY,
        arrowX: nextArrowX / _scaleX,
        arrowY: nextArrowY / _scaleY,
        scaleX: _scaleX,
        scaleY: _scaleY,
        align: nextAlignInfo
      };
      setOffsetInfo(nextOffsetInfo);
    }
  });
  var triggerAlign = function triggerAlign2() {
    alignCountRef.current += 1;
    var id = alignCountRef.current;
    Promise.resolve().then(function() {
      if (alignCountRef.current === id) {
        onAlign();
      }
    });
  };
  var resetReady = function resetReady2() {
    setOffsetInfo(function(ori) {
      return _objectSpread2(_objectSpread2({}, ori), {}, {
        ready: false
      });
    });
  };
  useLayoutEffect_default(resetReady, [placement]);
  useLayoutEffect_default(function() {
    if (!open) {
      resetReady();
    }
  }, [open]);
  return [offsetInfo.ready, offsetInfo.offsetX, offsetInfo.offsetY, offsetInfo.offsetR, offsetInfo.offsetB, offsetInfo.arrowX, offsetInfo.arrowY, offsetInfo.scaleX, offsetInfo.scaleY, offsetInfo.align, triggerAlign];
}

// node_modules/@rc-component/trigger/es/hooks/useWatch.js
function useWatch(open, target, popup, onAlign, onScroll) {
  useLayoutEffect_default(function() {
    if (open && target && popup) {
      let notifyScroll = function() {
        onAlign();
        onScroll();
      };
      var targetElement = target;
      var popupElement = popup;
      var targetScrollList = collectScroller(targetElement);
      var popupScrollList = collectScroller(popupElement);
      var win = getWin(popupElement);
      var mergedList = new Set([win].concat(_toConsumableArray(targetScrollList), _toConsumableArray(popupScrollList)));
      mergedList.forEach(function(scroller) {
        scroller.addEventListener("scroll", notifyScroll, {
          passive: true
        });
      });
      win.addEventListener("resize", notifyScroll, {
        passive: true
      });
      onAlign();
      return function() {
        mergedList.forEach(function(scroller) {
          scroller.removeEventListener("scroll", notifyScroll);
          win.removeEventListener("resize", notifyScroll);
        });
      };
    }
  }, [open, target, popup]);
}

// node_modules/@rc-component/trigger/es/hooks/useWinClick.js
var React56 = __toESM(require_react());
function useWinClick(open, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen) {
  var openRef = React56.useRef(open);
  openRef.current = open;
  var popupPointerDownRef = React56.useRef(false);
  React56.useEffect(function() {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      var onPointerDown = function onPointerDown2() {
        popupPointerDownRef.current = false;
      };
      var onTriggerClose = function onTriggerClose2(e) {
        var _e$composedPath;
        if (openRef.current && !inPopupOrChild(((_e$composedPath = e.composedPath) === null || _e$composedPath === void 0 || (_e$composedPath = _e$composedPath.call(e)) === null || _e$composedPath === void 0 ? void 0 : _e$composedPath[0]) || e.target) && !popupPointerDownRef.current) {
          triggerOpen(false);
        }
      };
      var win = getWin(popupEle);
      win.addEventListener("pointerdown", onPointerDown, true);
      win.addEventListener("mousedown", onTriggerClose, true);
      win.addEventListener("contextmenu", onTriggerClose, true);
      var targetShadowRoot = getShadowRoot(targetEle);
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener("mousedown", onTriggerClose, true);
        targetShadowRoot.addEventListener("contextmenu", onTriggerClose, true);
      }
      if (true) {
        var _targetEle$getRootNod, _popupEle$getRootNode;
        var targetRoot = targetEle === null || targetEle === void 0 || (_targetEle$getRootNod = targetEle.getRootNode) === null || _targetEle$getRootNod === void 0 ? void 0 : _targetEle$getRootNod.call(targetEle);
        var popupRoot = (_popupEle$getRootNode = popupEle.getRootNode) === null || _popupEle$getRootNode === void 0 ? void 0 : _popupEle$getRootNode.call(popupEle);
        warning(targetRoot === popupRoot, "trigger element and popup element should in same shadow root.");
      }
      return function() {
        win.removeEventListener("pointerdown", onPointerDown, true);
        win.removeEventListener("mousedown", onTriggerClose, true);
        win.removeEventListener("contextmenu", onTriggerClose, true);
        if (targetShadowRoot) {
          targetShadowRoot.removeEventListener("mousedown", onTriggerClose, true);
          targetShadowRoot.removeEventListener("contextmenu", onTriggerClose, true);
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
  function onPopupPointerDown() {
    popupPointerDownRef.current = true;
  }
  return onPopupPointerDown;
}

// node_modules/@rc-component/trigger/es/index.js
var _excluded5 = ["prefixCls", "children", "action", "showAction", "hideAction", "popupVisible", "defaultPopupVisible", "onPopupVisibleChange", "afterPopupVisibleChange", "mouseEnterDelay", "mouseLeaveDelay", "focusDelay", "blurDelay", "mask", "maskClosable", "getPopupContainer", "forceRender", "autoDestroy", "destroyPopupOnHide", "popup", "popupClassName", "popupStyle", "popupPlacement", "builtinPlacements", "popupAlign", "zIndex", "stretch", "getPopupClassNameFromAlign", "fresh", "alignPoint", "onPopupClick", "onPopupAlign", "arrow", "popupMotion", "maskMotion", "popupTransitionName", "popupAnimation", "maskTransitionName", "maskAnimation", "className", "getTriggerDOMNode"];
function generateTrigger() {
  var PortalComponent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : es_default3;
  var Trigger = React57.forwardRef(function(props, ref) {
    var _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-trigger-popup" : _props$prefixCls, children = props.children, _props$action = props.action, action = _props$action === void 0 ? "hover" : _props$action, showAction = props.showAction, hideAction = props.hideAction, popupVisible = props.popupVisible, defaultPopupVisible = props.defaultPopupVisible, onPopupVisibleChange = props.onPopupVisibleChange, afterPopupVisibleChange = props.afterPopupVisibleChange, mouseEnterDelay = props.mouseEnterDelay, _props$mouseLeaveDela = props.mouseLeaveDelay, mouseLeaveDelay = _props$mouseLeaveDela === void 0 ? 0.1 : _props$mouseLeaveDela, focusDelay = props.focusDelay, blurDelay = props.blurDelay, mask = props.mask, _props$maskClosable = props.maskClosable, maskClosable = _props$maskClosable === void 0 ? true : _props$maskClosable, getPopupContainer = props.getPopupContainer, forceRender = props.forceRender, autoDestroy = props.autoDestroy, destroyPopupOnHide = props.destroyPopupOnHide, popup = props.popup, popupClassName = props.popupClassName, popupStyle = props.popupStyle, popupPlacement = props.popupPlacement, _props$builtinPlaceme = props.builtinPlacements, builtinPlacements = _props$builtinPlaceme === void 0 ? {} : _props$builtinPlaceme, popupAlign = props.popupAlign, zIndex = props.zIndex, stretch = props.stretch, getPopupClassNameFromAlign = props.getPopupClassNameFromAlign, fresh = props.fresh, alignPoint = props.alignPoint, onPopupClick = props.onPopupClick, onPopupAlign = props.onPopupAlign, arrow = props.arrow, popupMotion = props.popupMotion, maskMotion = props.maskMotion, popupTransitionName = props.popupTransitionName, popupAnimation = props.popupAnimation, maskTransitionName = props.maskTransitionName, maskAnimation = props.maskAnimation, className = props.className, getTriggerDOMNode = props.getTriggerDOMNode, restProps = _objectWithoutProperties(props, _excluded5);
    var mergedAutoDestroy = autoDestroy || destroyPopupOnHide || false;
    var _React$useState = React57.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), mobile = _React$useState2[0], setMobile = _React$useState2[1];
    useLayoutEffect_default(function() {
      setMobile(isMobile_default());
    }, []);
    var subPopupElements = React57.useRef({});
    var parentContext = React57.useContext(context_default2);
    var context = React57.useMemo(function() {
      return {
        registerSubPopup: function registerSubPopup(id2, subPopupEle) {
          subPopupElements.current[id2] = subPopupEle;
          parentContext === null || parentContext === void 0 || parentContext.registerSubPopup(id2, subPopupEle);
        }
      };
    }, [parentContext]);
    var id = useId_default();
    var _React$useState3 = React57.useState(null), _React$useState4 = _slicedToArray(_React$useState3, 2), popupEle = _React$useState4[0], setPopupEle = _React$useState4[1];
    var externalPopupRef = React57.useRef(null);
    var setPopupRef = useEvent(function(node) {
      externalPopupRef.current = node;
      if (isDOM(node) && popupEle !== node) {
        setPopupEle(node);
      }
      parentContext === null || parentContext === void 0 || parentContext.registerSubPopup(id, node);
    });
    var _React$useState5 = React57.useState(null), _React$useState6 = _slicedToArray(_React$useState5, 2), targetEle = _React$useState6[0], setTargetEle = _React$useState6[1];
    var externalForwardRef = React57.useRef(null);
    var setTargetRef = useEvent(function(node) {
      if (isDOM(node) && targetEle !== node) {
        setTargetEle(node);
        externalForwardRef.current = node;
      }
    });
    var child = React57.Children.only(children);
    var originChildProps = (child === null || child === void 0 ? void 0 : child.props) || {};
    var cloneProps = {};
    var inPopupOrChild = useEvent(function(ele) {
      var _getShadowRoot, _getShadowRoot2;
      var childDOM = targetEle;
      return (childDOM === null || childDOM === void 0 ? void 0 : childDOM.contains(ele)) || ((_getShadowRoot = getShadowRoot(childDOM)) === null || _getShadowRoot === void 0 ? void 0 : _getShadowRoot.host) === ele || ele === childDOM || (popupEle === null || popupEle === void 0 ? void 0 : popupEle.contains(ele)) || ((_getShadowRoot2 = getShadowRoot(popupEle)) === null || _getShadowRoot2 === void 0 ? void 0 : _getShadowRoot2.host) === ele || ele === popupEle || Object.values(subPopupElements.current).some(function(subPopupEle) {
        return (subPopupEle === null || subPopupEle === void 0 ? void 0 : subPopupEle.contains(ele)) || ele === subPopupEle;
      });
    });
    var mergePopupMotion = getMotion(prefixCls, popupMotion, popupAnimation, popupTransitionName);
    var mergeMaskMotion = getMotion(prefixCls, maskMotion, maskAnimation, maskTransitionName);
    var _React$useState7 = React57.useState(defaultPopupVisible || false), _React$useState8 = _slicedToArray(_React$useState7, 2), internalOpen = _React$useState8[0], setInternalOpen = _React$useState8[1];
    var mergedOpen = popupVisible !== null && popupVisible !== void 0 ? popupVisible : internalOpen;
    var setMergedOpen = useEvent(function(nextOpen) {
      if (popupVisible === void 0) {
        setInternalOpen(nextOpen);
      }
    });
    useLayoutEffect_default(function() {
      setInternalOpen(popupVisible || false);
    }, [popupVisible]);
    var openRef = React57.useRef(mergedOpen);
    openRef.current = mergedOpen;
    var lastTriggerRef = React57.useRef([]);
    lastTriggerRef.current = [];
    var internalTriggerOpen = useEvent(function(nextOpen) {
      var _lastTriggerRef$curre;
      setMergedOpen(nextOpen);
      if (((_lastTriggerRef$curre = lastTriggerRef.current[lastTriggerRef.current.length - 1]) !== null && _lastTriggerRef$curre !== void 0 ? _lastTriggerRef$curre : mergedOpen) !== nextOpen) {
        lastTriggerRef.current.push(nextOpen);
        onPopupVisibleChange === null || onPopupVisibleChange === void 0 || onPopupVisibleChange(nextOpen);
      }
    });
    var delayRef = React57.useRef();
    var clearDelay = function clearDelay2() {
      clearTimeout(delayRef.current);
    };
    var triggerOpen = function triggerOpen2(nextOpen) {
      var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      clearDelay();
      if (delay === 0) {
        internalTriggerOpen(nextOpen);
      } else {
        delayRef.current = setTimeout(function() {
          internalTriggerOpen(nextOpen);
        }, delay * 1e3);
      }
    };
    React57.useEffect(function() {
      return clearDelay;
    }, []);
    var _React$useState9 = React57.useState(false), _React$useState10 = _slicedToArray(_React$useState9, 2), inMotion = _React$useState10[0], setInMotion = _React$useState10[1];
    useLayoutEffect_default(function(firstMount) {
      if (!firstMount || mergedOpen) {
        setInMotion(true);
      }
    }, [mergedOpen]);
    var _React$useState11 = React57.useState(null), _React$useState12 = _slicedToArray(_React$useState11, 2), motionPrepareResolve = _React$useState12[0], setMotionPrepareResolve = _React$useState12[1];
    var _React$useState13 = React57.useState(null), _React$useState14 = _slicedToArray(_React$useState13, 2), mousePos = _React$useState14[0], setMousePos = _React$useState14[1];
    var setMousePosByEvent = function setMousePosByEvent2(event) {
      setMousePos([event.clientX, event.clientY]);
    };
    var _useAlign = useAlign(mergedOpen, popupEle, alignPoint && mousePos !== null ? mousePos : targetEle, popupPlacement, builtinPlacements, popupAlign, onPopupAlign), _useAlign2 = _slicedToArray(_useAlign, 11), ready = _useAlign2[0], offsetX = _useAlign2[1], offsetY = _useAlign2[2], offsetR = _useAlign2[3], offsetB = _useAlign2[4], arrowX = _useAlign2[5], arrowY = _useAlign2[6], scaleX = _useAlign2[7], scaleY = _useAlign2[8], alignInfo = _useAlign2[9], onAlign = _useAlign2[10];
    var _useAction = useAction(mobile, action, showAction, hideAction), _useAction2 = _slicedToArray(_useAction, 2), showActions = _useAction2[0], hideActions = _useAction2[1];
    var clickToShow = showActions.has("click");
    var clickToHide = hideActions.has("click") || hideActions.has("contextMenu");
    var triggerAlign = useEvent(function() {
      if (!inMotion) {
        onAlign();
      }
    });
    var onScroll = function onScroll2() {
      if (openRef.current && alignPoint && clickToHide) {
        triggerOpen(false);
      }
    };
    useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);
    useLayoutEffect_default(function() {
      triggerAlign();
    }, [mousePos, popupPlacement]);
    useLayoutEffect_default(function() {
      if (mergedOpen && !(builtinPlacements !== null && builtinPlacements !== void 0 && builtinPlacements[popupPlacement])) {
        triggerAlign();
      }
    }, [JSON.stringify(popupAlign)]);
    var alignedClassName = React57.useMemo(function() {
      var baseClassName = getAlignPopupClassName(builtinPlacements, prefixCls, alignInfo, alignPoint);
      return (0, import_classnames15.default)(baseClassName, getPopupClassNameFromAlign === null || getPopupClassNameFromAlign === void 0 ? void 0 : getPopupClassNameFromAlign(alignInfo));
    }, [alignInfo, getPopupClassNameFromAlign, builtinPlacements, prefixCls, alignPoint]);
    React57.useImperativeHandle(ref, function() {
      return {
        nativeElement: externalForwardRef.current,
        popupElement: externalPopupRef.current,
        forceAlign: triggerAlign
      };
    });
    var _React$useState15 = React57.useState(0), _React$useState16 = _slicedToArray(_React$useState15, 2), targetWidth = _React$useState16[0], setTargetWidth = _React$useState16[1];
    var _React$useState17 = React57.useState(0), _React$useState18 = _slicedToArray(_React$useState17, 2), targetHeight = _React$useState18[0], setTargetHeight = _React$useState18[1];
    var syncTargetSize = function syncTargetSize2() {
      if (stretch && targetEle) {
        var rect = targetEle.getBoundingClientRect();
        setTargetWidth(rect.width);
        setTargetHeight(rect.height);
      }
    };
    var onTargetResize = function onTargetResize2() {
      syncTargetSize();
      triggerAlign();
    };
    var onVisibleChanged = function onVisibleChanged2(visible) {
      setInMotion(false);
      onAlign();
      afterPopupVisibleChange === null || afterPopupVisibleChange === void 0 || afterPopupVisibleChange(visible);
    };
    var onPrepare = function onPrepare2() {
      return new Promise(function(resolve) {
        syncTargetSize();
        setMotionPrepareResolve(function() {
          return resolve;
        });
      });
    };
    useLayoutEffect_default(function() {
      if (motionPrepareResolve) {
        onAlign();
        motionPrepareResolve();
        setMotionPrepareResolve(null);
      }
    }, [motionPrepareResolve]);
    function wrapperAction(eventName, nextOpen, delay, preEvent) {
      cloneProps[eventName] = function(event) {
        var _originChildProps$eve;
        preEvent === null || preEvent === void 0 || preEvent(event);
        triggerOpen(nextOpen, delay);
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        (_originChildProps$eve = originChildProps[eventName]) === null || _originChildProps$eve === void 0 || _originChildProps$eve.call.apply(_originChildProps$eve, [originChildProps, event].concat(args));
      };
    }
    if (clickToShow || clickToHide) {
      cloneProps.onClick = function(event) {
        var _originChildProps$onC;
        if (openRef.current && clickToHide) {
          triggerOpen(false);
        } else if (!openRef.current && clickToShow) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        (_originChildProps$onC = originChildProps.onClick) === null || _originChildProps$onC === void 0 || _originChildProps$onC.call.apply(_originChildProps$onC, [originChildProps, event].concat(args));
      };
    }
    var onPopupPointerDown = useWinClick(mergedOpen, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen);
    var hoverToShow = showActions.has("hover");
    var hoverToHide = hideActions.has("hover");
    var onPopupMouseEnter;
    var onPopupMouseLeave;
    if (hoverToShow) {
      wrapperAction("onMouseEnter", true, mouseEnterDelay, function(event) {
        setMousePosByEvent(event);
      });
      wrapperAction("onPointerEnter", true, mouseEnterDelay, function(event) {
        setMousePosByEvent(event);
      });
      onPopupMouseEnter = function onPopupMouseEnter2(event) {
        if ((mergedOpen || inMotion) && popupEle !== null && popupEle !== void 0 && popupEle.contains(event.target)) {
          triggerOpen(true, mouseEnterDelay);
        }
      };
      if (alignPoint) {
        cloneProps.onMouseMove = function(event) {
          var _originChildProps$onM;
          (_originChildProps$onM = originChildProps.onMouseMove) === null || _originChildProps$onM === void 0 || _originChildProps$onM.call(originChildProps, event);
        };
      }
    }
    if (hoverToHide) {
      wrapperAction("onMouseLeave", false, mouseLeaveDelay);
      wrapperAction("onPointerLeave", false, mouseLeaveDelay);
      onPopupMouseLeave = function onPopupMouseLeave2() {
        triggerOpen(false, mouseLeaveDelay);
      };
    }
    if (showActions.has("focus")) {
      wrapperAction("onFocus", true, focusDelay);
    }
    if (hideActions.has("focus")) {
      wrapperAction("onBlur", false, blurDelay);
    }
    if (showActions.has("contextMenu")) {
      cloneProps.onContextMenu = function(event) {
        var _originChildProps$onC2;
        if (openRef.current && hideActions.has("contextMenu")) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }
        event.preventDefault();
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        (_originChildProps$onC2 = originChildProps.onContextMenu) === null || _originChildProps$onC2 === void 0 || _originChildProps$onC2.call.apply(_originChildProps$onC2, [originChildProps, event].concat(args));
      };
    }
    if (className) {
      cloneProps.className = (0, import_classnames15.default)(originChildProps.className, className);
    }
    var renderedRef = React57.useRef(false);
    renderedRef.current || (renderedRef.current = forceRender || mergedOpen || inMotion);
    var mergedChildrenProps = _objectSpread2(_objectSpread2({}, originChildProps), cloneProps);
    var passedProps = {};
    var passedEventList = ["onContextMenu", "onClick", "onMouseDown", "onTouchStart", "onMouseEnter", "onMouseLeave", "onFocus", "onBlur"];
    passedEventList.forEach(function(eventName) {
      if (restProps[eventName]) {
        passedProps[eventName] = function() {
          var _mergedChildrenProps$;
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }
          (_mergedChildrenProps$ = mergedChildrenProps[eventName]) === null || _mergedChildrenProps$ === void 0 || _mergedChildrenProps$.call.apply(_mergedChildrenProps$, [mergedChildrenProps].concat(args));
          restProps[eventName].apply(restProps, args);
        };
      }
    });
    var triggerNode = React57.cloneElement(child, _objectSpread2(_objectSpread2({}, mergedChildrenProps), passedProps));
    var arrowPos = {
      x: arrowX,
      y: arrowY
    };
    var innerArrow = arrow ? _objectSpread2({}, arrow !== true ? arrow : {}) : null;
    return React57.createElement(React57.Fragment, null, React57.createElement(es_default2, {
      disabled: !mergedOpen,
      ref: setTargetRef,
      onResize: onTargetResize
    }, React57.createElement(TriggerWrapper_default, {
      getTriggerDOMNode
    }, triggerNode)), renderedRef.current && React57.createElement(context_default2.Provider, {
      value: context
    }, React57.createElement(Popup_default, {
      portal: PortalComponent,
      ref: setPopupRef,
      prefixCls,
      popup,
      className: (0, import_classnames15.default)(popupClassName, alignedClassName),
      style: popupStyle,
      target: targetEle,
      onMouseEnter: onPopupMouseEnter,
      onMouseLeave: onPopupMouseLeave,
      onPointerEnter: onPopupMouseEnter,
      zIndex,
      open: mergedOpen,
      keepDom: inMotion,
      fresh,
      onClick: onPopupClick,
      onPointerDownCapture: onPopupPointerDown,
      mask,
      motion: mergePopupMotion,
      maskMotion: mergeMaskMotion,
      onVisibleChanged,
      onPrepare,
      forceRender,
      autoDestroy: mergedAutoDestroy,
      getPopupContainer,
      align: alignInfo,
      arrow: innerArrow,
      arrowPos,
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      onAlign: triggerAlign,
      stretch,
      targetWidth: targetWidth / scaleX,
      targetHeight: targetHeight / scaleY
    })));
  });
  if (true) {
    Trigger.displayName = "Trigger";
  }
  return Trigger;
}
var es_default4 = generateTrigger(es_default3);

// node_modules/rc-dropdown/es/Dropdown.js
var import_classnames16 = __toESM(require_classnames());
var import_react19 = __toESM(require_react());

// node_modules/rc-util/es/KeyCode.js
var KeyCode = {
  /**
   * MAC_ENTER
   */
  MAC_ENTER: 3,
  /**
   * BACKSPACE
   */
  BACKSPACE: 8,
  /**
   * TAB
   */
  TAB: 9,
  /**
   * NUMLOCK on FF/Safari Mac
   */
  NUM_CENTER: 12,
  // NUMLOCK on FF/Safari Mac
  /**
   * ENTER
   */
  ENTER: 13,
  /**
   * SHIFT
   */
  SHIFT: 16,
  /**
   * CTRL
   */
  CTRL: 17,
  /**
   * ALT
   */
  ALT: 18,
  /**
   * PAUSE
   */
  PAUSE: 19,
  /**
   * CAPS_LOCK
   */
  CAPS_LOCK: 20,
  /**
   * ESC
   */
  ESC: 27,
  /**
   * SPACE
   */
  SPACE: 32,
  /**
   * PAGE_UP
   */
  PAGE_UP: 33,
  // also NUM_NORTH_EAST
  /**
   * PAGE_DOWN
   */
  PAGE_DOWN: 34,
  // also NUM_SOUTH_EAST
  /**
   * END
   */
  END: 35,
  // also NUM_SOUTH_WEST
  /**
   * HOME
   */
  HOME: 36,
  // also NUM_NORTH_WEST
  /**
   * LEFT
   */
  LEFT: 37,
  // also NUM_WEST
  /**
   * UP
   */
  UP: 38,
  // also NUM_NORTH
  /**
   * RIGHT
   */
  RIGHT: 39,
  // also NUM_EAST
  /**
   * DOWN
   */
  DOWN: 40,
  // also NUM_SOUTH
  /**
   * PRINT_SCREEN
   */
  PRINT_SCREEN: 44,
  /**
   * INSERT
   */
  INSERT: 45,
  // also NUM_INSERT
  /**
   * DELETE
   */
  DELETE: 46,
  // also NUM_DELETE
  /**
   * ZERO
   */
  ZERO: 48,
  /**
   * ONE
   */
  ONE: 49,
  /**
   * TWO
   */
  TWO: 50,
  /**
   * THREE
   */
  THREE: 51,
  /**
   * FOUR
   */
  FOUR: 52,
  /**
   * FIVE
   */
  FIVE: 53,
  /**
   * SIX
   */
  SIX: 54,
  /**
   * SEVEN
   */
  SEVEN: 55,
  /**
   * EIGHT
   */
  EIGHT: 56,
  /**
   * NINE
   */
  NINE: 57,
  /**
   * QUESTION_MARK
   */
  QUESTION_MARK: 63,
  // needs localization
  /**
   * A
   */
  A: 65,
  /**
   * B
   */
  B: 66,
  /**
   * C
   */
  C: 67,
  /**
   * D
   */
  D: 68,
  /**
   * E
   */
  E: 69,
  /**
   * F
   */
  F: 70,
  /**
   * G
   */
  G: 71,
  /**
   * H
   */
  H: 72,
  /**
   * I
   */
  I: 73,
  /**
   * J
   */
  J: 74,
  /**
   * K
   */
  K: 75,
  /**
   * L
   */
  L: 76,
  /**
   * M
   */
  M: 77,
  /**
   * N
   */
  N: 78,
  /**
   * O
   */
  O: 79,
  /**
   * P
   */
  P: 80,
  /**
   * Q
   */
  Q: 81,
  /**
   * R
   */
  R: 82,
  /**
   * S
   */
  S: 83,
  /**
   * T
   */
  T: 84,
  /**
   * U
   */
  U: 85,
  /**
   * V
   */
  V: 86,
  /**
   * W
   */
  W: 87,
  /**
   * X
   */
  X: 88,
  /**
   * Y
   */
  Y: 89,
  /**
   * Z
   */
  Z: 90,
  /**
   * META
   */
  META: 91,
  // WIN_KEY_LEFT
  /**
   * WIN_KEY_RIGHT
   */
  WIN_KEY_RIGHT: 92,
  /**
   * CONTEXT_MENU
   */
  CONTEXT_MENU: 93,
  /**
   * NUM_ZERO
   */
  NUM_ZERO: 96,
  /**
   * NUM_ONE
   */
  NUM_ONE: 97,
  /**
   * NUM_TWO
   */
  NUM_TWO: 98,
  /**
   * NUM_THREE
   */
  NUM_THREE: 99,
  /**
   * NUM_FOUR
   */
  NUM_FOUR: 100,
  /**
   * NUM_FIVE
   */
  NUM_FIVE: 101,
  /**
   * NUM_SIX
   */
  NUM_SIX: 102,
  /**
   * NUM_SEVEN
   */
  NUM_SEVEN: 103,
  /**
   * NUM_EIGHT
   */
  NUM_EIGHT: 104,
  /**
   * NUM_NINE
   */
  NUM_NINE: 105,
  /**
   * NUM_MULTIPLY
   */
  NUM_MULTIPLY: 106,
  /**
   * NUM_PLUS
   */
  NUM_PLUS: 107,
  /**
   * NUM_MINUS
   */
  NUM_MINUS: 109,
  /**
   * NUM_PERIOD
   */
  NUM_PERIOD: 110,
  /**
   * NUM_DIVISION
   */
  NUM_DIVISION: 111,
  /**
   * F1
   */
  F1: 112,
  /**
   * F2
   */
  F2: 113,
  /**
   * F3
   */
  F3: 114,
  /**
   * F4
   */
  F4: 115,
  /**
   * F5
   */
  F5: 116,
  /**
   * F6
   */
  F6: 117,
  /**
   * F7
   */
  F7: 118,
  /**
   * F8
   */
  F8: 119,
  /**
   * F9
   */
  F9: 120,
  /**
   * F10
   */
  F10: 121,
  /**
   * F11
   */
  F11: 122,
  /**
   * F12
   */
  F12: 123,
  /**
   * NUMLOCK
   */
  NUMLOCK: 144,
  /**
   * SEMICOLON
   */
  SEMICOLON: 186,
  // needs localization
  /**
   * DASH
   */
  DASH: 189,
  // needs localization
  /**
   * EQUALS
   */
  EQUALS: 187,
  // needs localization
  /**
   * COMMA
   */
  COMMA: 188,
  // needs localization
  /**
   * PERIOD
   */
  PERIOD: 190,
  // needs localization
  /**
   * SLASH
   */
  SLASH: 191,
  // needs localization
  /**
   * APOSTROPHE
   */
  APOSTROPHE: 192,
  // needs localization
  /**
   * SINGLE_QUOTE
   */
  SINGLE_QUOTE: 222,
  // needs localization
  /**
   * OPEN_SQUARE_BRACKET
   */
  OPEN_SQUARE_BRACKET: 219,
  // needs localization
  /**
   * BACKSLASH
   */
  BACKSLASH: 220,
  // needs localization
  /**
   * CLOSE_SQUARE_BRACKET
   */
  CLOSE_SQUARE_BRACKET: 221,
  // needs localization
  /**
   * WIN_KEY
   */
  WIN_KEY: 224,
  /**
   * MAC_FF_META
   */
  MAC_FF_META: 224,
  // Firefox (Gecko) fires this for the meta key instead of 91
  /**
   * WIN_IME
   */
  WIN_IME: 229,
  // ======================== Function ========================
  /**
   * whether text and modified key is entered at the same time.
   */
  isTextModifyingKeyEvent: function isTextModifyingKeyEvent(e) {
    var keyCode = e.keyCode;
    if (e.altKey && !e.ctrlKey || e.metaKey || // Function keys don't generate text
    keyCode >= KeyCode.F1 && keyCode <= KeyCode.F12) {
      return false;
    }
    switch (keyCode) {
      case KeyCode.ALT:
      case KeyCode.CAPS_LOCK:
      case KeyCode.CONTEXT_MENU:
      case KeyCode.CTRL:
      case KeyCode.DOWN:
      case KeyCode.END:
      case KeyCode.ESC:
      case KeyCode.HOME:
      case KeyCode.INSERT:
      case KeyCode.LEFT:
      case KeyCode.MAC_FF_META:
      case KeyCode.META:
      case KeyCode.NUMLOCK:
      case KeyCode.NUM_CENTER:
      case KeyCode.PAGE_DOWN:
      case KeyCode.PAGE_UP:
      case KeyCode.PAUSE:
      case KeyCode.PRINT_SCREEN:
      case KeyCode.RIGHT:
      case KeyCode.SHIFT:
      case KeyCode.UP:
      case KeyCode.WIN_KEY:
      case KeyCode.WIN_KEY_RIGHT:
        return false;
      default:
        return true;
    }
  },
  /**
   * whether character is entered.
   */
  isCharacterKey: function isCharacterKey(keyCode) {
    if (keyCode >= KeyCode.ZERO && keyCode <= KeyCode.NINE) {
      return true;
    }
    if (keyCode >= KeyCode.NUM_ZERO && keyCode <= KeyCode.NUM_MULTIPLY) {
      return true;
    }
    if (keyCode >= KeyCode.A && keyCode <= KeyCode.Z) {
      return true;
    }
    if (window.navigator.userAgent.indexOf("WebKit") !== -1 && keyCode === 0) {
      return true;
    }
    switch (keyCode) {
      case KeyCode.SPACE:
      case KeyCode.QUESTION_MARK:
      case KeyCode.NUM_PLUS:
      case KeyCode.NUM_MINUS:
      case KeyCode.NUM_PERIOD:
      case KeyCode.NUM_DIVISION:
      case KeyCode.SEMICOLON:
      case KeyCode.DASH:
      case KeyCode.EQUALS:
      case KeyCode.COMMA:
      case KeyCode.PERIOD:
      case KeyCode.SLASH:
      case KeyCode.APOSTROPHE:
      case KeyCode.SINGLE_QUOTE:
      case KeyCode.OPEN_SQUARE_BRACKET:
      case KeyCode.BACKSLASH:
      case KeyCode.CLOSE_SQUARE_BRACKET:
        return true;
      default:
        return false;
    }
  }
};
var KeyCode_default = KeyCode;

// node_modules/rc-dropdown/es/hooks/useAccessibility.js
var React58 = __toESM(require_react());
var ESC = KeyCode_default.ESC;
var TAB = KeyCode_default.TAB;
function useAccessibility(_ref) {
  var visible = _ref.visible, triggerRef = _ref.triggerRef, onVisibleChange = _ref.onVisibleChange, autoFocus = _ref.autoFocus, overlayRef = _ref.overlayRef;
  var focusMenuRef = React58.useRef(false);
  var handleCloseMenuAndReturnFocus = function handleCloseMenuAndReturnFocus2() {
    if (visible) {
      var _triggerRef$current, _triggerRef$current$f;
      (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 || (_triggerRef$current$f = _triggerRef$current.focus) === null || _triggerRef$current$f === void 0 || _triggerRef$current$f.call(_triggerRef$current);
      onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(false);
    }
  };
  var focusMenu = function focusMenu2() {
    var _overlayRef$current;
    if ((_overlayRef$current = overlayRef.current) !== null && _overlayRef$current !== void 0 && _overlayRef$current.focus) {
      overlayRef.current.focus();
      focusMenuRef.current = true;
      return true;
    }
    return false;
  };
  var handleKeyDown = function handleKeyDown2(event) {
    switch (event.keyCode) {
      case ESC:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB: {
        var focusResult = false;
        if (!focusMenuRef.current) {
          focusResult = focusMenu();
        }
        if (focusResult) {
          event.preventDefault();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
      }
    }
  };
  React58.useEffect(function() {
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
      if (autoFocus) {
        raf_default(focusMenu, 3);
      }
      return function() {
        window.removeEventListener("keydown", handleKeyDown);
        focusMenuRef.current = false;
      };
    }
    return function() {
      focusMenuRef.current = false;
    };
  }, [visible]);
}

// node_modules/rc-dropdown/es/Overlay.js
var import_react18 = __toESM(require_react());
var Overlay = (0, import_react18.forwardRef)(function(props, ref) {
  var overlay = props.overlay, arrow = props.arrow, prefixCls = props.prefixCls;
  var overlayNode = (0, import_react18.useMemo)(function() {
    var overlayElement;
    if (typeof overlay === "function") {
      overlayElement = overlay();
    } else {
      overlayElement = overlay;
    }
    return overlayElement;
  }, [overlay]);
  var composedRef = composeRef(ref, getNodeRef(overlayNode));
  return import_react18.default.createElement(import_react18.default.Fragment, null, arrow && import_react18.default.createElement("div", {
    className: "".concat(prefixCls, "-arrow")
  }), import_react18.default.cloneElement(overlayNode, {
    ref: supportRef(overlayNode) ? composedRef : void 0
  }));
});
var Overlay_default = Overlay;

// node_modules/rc-dropdown/es/placements.js
var autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1
};
var targetOffset = [0, 0];
var placements = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset
  },
  top: {
    points: ["bc", "tc"],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset
  },
  topRight: {
    points: ["br", "tr"],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset
  },
  bottom: {
    points: ["tc", "bc"],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset
  },
  bottomRight: {
    points: ["tr", "br"],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset
  }
};
var placements_default = placements;

// node_modules/rc-dropdown/es/Dropdown.js
var _excluded6 = ["arrow", "prefixCls", "transitionName", "animation", "align", "placement", "placements", "getPopupContainer", "showAction", "hideAction", "overlayClassName", "overlayStyle", "visible", "trigger", "autoFocus", "overlay", "children", "onVisibleChange"];
function Dropdown(props, ref) {
  var _children$props;
  var _props$arrow = props.arrow, arrow = _props$arrow === void 0 ? false : _props$arrow, _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-dropdown" : _props$prefixCls, transitionName = props.transitionName, animation = props.animation, align = props.align, _props$placement = props.placement, placement = _props$placement === void 0 ? "bottomLeft" : _props$placement, _props$placements = props.placements, placements3 = _props$placements === void 0 ? placements_default : _props$placements, getPopupContainer = props.getPopupContainer, showAction = props.showAction, hideAction = props.hideAction, overlayClassName = props.overlayClassName, overlayStyle = props.overlayStyle, visible = props.visible, _props$trigger = props.trigger, trigger = _props$trigger === void 0 ? ["hover"] : _props$trigger, autoFocus = props.autoFocus, overlay = props.overlay, children = props.children, onVisibleChange = props.onVisibleChange, otherProps = _objectWithoutProperties(props, _excluded6);
  var _React$useState = import_react19.default.useState(), _React$useState2 = _slicedToArray(_React$useState, 2), triggerVisible = _React$useState2[0], setTriggerVisible = _React$useState2[1];
  var mergedVisible = "visible" in props ? visible : triggerVisible;
  var triggerRef = import_react19.default.useRef(null);
  var overlayRef = import_react19.default.useRef(null);
  var childRef = import_react19.default.useRef(null);
  import_react19.default.useImperativeHandle(ref, function() {
    return triggerRef.current;
  });
  var handleVisibleChange = function handleVisibleChange2(newVisible) {
    setTriggerVisible(newVisible);
    onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(newVisible);
  };
  useAccessibility({
    visible: mergedVisible,
    triggerRef: childRef,
    onVisibleChange: handleVisibleChange,
    autoFocus,
    overlayRef
  });
  var onClick = function onClick2(e) {
    var onOverlayClick = props.onOverlayClick;
    setTriggerVisible(false);
    if (onOverlayClick) {
      onOverlayClick(e);
    }
  };
  var getMenuElement = function getMenuElement2() {
    return import_react19.default.createElement(Overlay_default, {
      ref: overlayRef,
      overlay,
      prefixCls,
      arrow
    });
  };
  var getMenuElementOrLambda = function getMenuElementOrLambda2() {
    if (typeof overlay === "function") {
      return getMenuElement;
    }
    return getMenuElement();
  };
  var getMinOverlayWidthMatchTrigger = function getMinOverlayWidthMatchTrigger2() {
    var minOverlayWidthMatchTrigger = props.minOverlayWidthMatchTrigger, alignPoint = props.alignPoint;
    if ("minOverlayWidthMatchTrigger" in props) {
      return minOverlayWidthMatchTrigger;
    }
    return !alignPoint;
  };
  var getOpenClassName = function getOpenClassName2() {
    var openClassName = props.openClassName;
    if (openClassName !== void 0) {
      return openClassName;
    }
    return "".concat(prefixCls, "-open");
  };
  var childrenNode = import_react19.default.cloneElement(children, {
    className: (0, import_classnames16.default)((_children$props = children.props) === null || _children$props === void 0 ? void 0 : _children$props.className, mergedVisible && getOpenClassName()),
    ref: supportRef(children) ? composeRef(childRef, getNodeRef(children)) : void 0
  });
  var triggerHideAction = hideAction;
  if (!triggerHideAction && trigger.indexOf("contextMenu") !== -1) {
    triggerHideAction = ["click"];
  }
  return import_react19.default.createElement(es_default4, _extends({
    builtinPlacements: placements3
  }, otherProps, {
    prefixCls,
    ref: triggerRef,
    popupClassName: (0, import_classnames16.default)(overlayClassName, _defineProperty({}, "".concat(prefixCls, "-show-arrow"), arrow)),
    popupStyle: overlayStyle,
    action: trigger,
    showAction,
    hideAction: triggerHideAction,
    popupPlacement: placement,
    popupAlign: align,
    popupTransitionName: transitionName,
    popupAnimation: animation,
    popupVisible: mergedVisible,
    stretch: getMinOverlayWidthMatchTrigger() ? "minWidth" : "",
    popup: getMenuElementOrLambda(),
    onPopupVisibleChange: handleVisibleChange,
    onPopupClick: onClick,
    getPopupContainer
  }), childrenNode);
}
var Dropdown_default = import_react19.default.forwardRef(Dropdown);

// node_modules/rc-dropdown/es/index.js
var es_default5 = Dropdown_default;

// node_modules/rc-menu/es/Menu.js
var import_classnames26 = __toESM(require_classnames());

// node_modules/rc-overflow/es/Overflow.js
var React65 = __toESM(require_react());
var import_react21 = __toESM(require_react());
var import_classnames19 = __toESM(require_classnames());

// node_modules/rc-overflow/es/Item.js
var React61 = __toESM(require_react());
var import_classnames17 = __toESM(require_classnames());
var _excluded7 = ["prefixCls", "invalidate", "item", "renderItem", "responsive", "responsiveDisabled", "registerSize", "itemKey", "className", "style", "children", "display", "order", "component"];
var UNDEFINED = void 0;
function InternalItem(props, ref) {
  var prefixCls = props.prefixCls, invalidate = props.invalidate, item = props.item, renderItem = props.renderItem, responsive = props.responsive, responsiveDisabled = props.responsiveDisabled, registerSize = props.registerSize, itemKey = props.itemKey, className = props.className, style2 = props.style, children = props.children, display = props.display, order = props.order, _props$component = props.component, Component6 = _props$component === void 0 ? "div" : _props$component, restProps = _objectWithoutProperties(props, _excluded7);
  var mergedHidden = responsive && !display;
  function internalRegisterSize(width) {
    registerSize(itemKey, width);
  }
  React61.useEffect(function() {
    return function() {
      internalRegisterSize(null);
    };
  }, []);
  var childNode = renderItem && item !== UNDEFINED ? renderItem(item, {
    index: order
  }) : children;
  var overflowStyle;
  if (!invalidate) {
    overflowStyle = {
      opacity: mergedHidden ? 0 : 1,
      height: mergedHidden ? 0 : UNDEFINED,
      overflowY: mergedHidden ? "hidden" : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden ? "none" : UNDEFINED,
      position: mergedHidden ? "absolute" : UNDEFINED
    };
  }
  var overflowProps = {};
  if (mergedHidden) {
    overflowProps["aria-hidden"] = true;
  }
  var itemNode = React61.createElement(Component6, _extends({
    className: (0, import_classnames17.default)(!invalidate && prefixCls, className),
    style: _objectSpread2(_objectSpread2({}, overflowStyle), style2)
  }, overflowProps, restProps, {
    ref
  }), childNode);
  if (responsive) {
    itemNode = React61.createElement(es_default2, {
      onResize: function onResize2(_ref) {
        var offsetWidth = _ref.offsetWidth;
        internalRegisterSize(offsetWidth);
      },
      disabled: responsiveDisabled
    }, itemNode);
  }
  return itemNode;
}
var Item = React61.forwardRef(InternalItem);
Item.displayName = "Item";
var Item_default = Item;

// node_modules/rc-overflow/es/hooks/useEffectState.js
var React62 = __toESM(require_react());
var import_react_dom3 = __toESM(require_react_dom());

// node_modules/rc-overflow/es/hooks/channelUpdate.js
function channelUpdate(callback) {
  if (typeof MessageChannel === "undefined") {
    raf_default(callback);
  } else {
    var channel = new MessageChannel();
    channel.port1.onmessage = function() {
      return callback();
    };
    channel.port2.postMessage(void 0);
  }
}

// node_modules/rc-overflow/es/hooks/useEffectState.js
function useBatcher() {
  var updateFuncRef = React62.useRef(null);
  var notifyEffectUpdate = function notifyEffectUpdate2(callback) {
    if (!updateFuncRef.current) {
      updateFuncRef.current = [];
      channelUpdate(function() {
        (0, import_react_dom3.unstable_batchedUpdates)(function() {
          updateFuncRef.current.forEach(function(fn) {
            fn();
          });
          updateFuncRef.current = null;
        });
      });
    }
    updateFuncRef.current.push(callback);
  };
  return notifyEffectUpdate;
}
function useEffectState(notifyEffectUpdate, defaultValue) {
  var _React$useState = React62.useState(defaultValue), _React$useState2 = _slicedToArray(_React$useState, 2), stateValue = _React$useState2[0], setStateValue = _React$useState2[1];
  var setEffectVal = useEvent(function(nextValue) {
    notifyEffectUpdate(function() {
      setStateValue(nextValue);
    });
  });
  return [stateValue, setEffectVal];
}

// node_modules/rc-overflow/es/RawItem.js
var React64 = __toESM(require_react());
var import_classnames18 = __toESM(require_classnames());

// node_modules/rc-overflow/es/context.js
var import_react20 = __toESM(require_react());
var OverflowContext = import_react20.default.createContext(null);

// node_modules/rc-overflow/es/RawItem.js
var _excluded8 = ["component"];
var _excluded23 = ["className"];
var _excluded32 = ["className"];
var InternalRawItem = function InternalRawItem2(props, ref) {
  var context = React64.useContext(OverflowContext);
  if (!context) {
    var _props$component = props.component, Component6 = _props$component === void 0 ? "div" : _props$component, _restProps = _objectWithoutProperties(props, _excluded8);
    return React64.createElement(Component6, _extends({}, _restProps, {
      ref
    }));
  }
  var contextClassName = context.className, restContext = _objectWithoutProperties(context, _excluded23);
  var className = props.className, restProps = _objectWithoutProperties(props, _excluded32);
  return React64.createElement(OverflowContext.Provider, {
    value: null
  }, React64.createElement(Item_default, _extends({
    ref,
    className: (0, import_classnames18.default)(contextClassName, className)
  }, restContext, restProps)));
};
var RawItem = React64.forwardRef(InternalRawItem);
RawItem.displayName = "RawItem";
var RawItem_default = RawItem;

// node_modules/rc-overflow/es/Overflow.js
var _excluded9 = ["prefixCls", "data", "renderItem", "renderRawItem", "itemKey", "itemWidth", "ssr", "style", "className", "maxCount", "renderRest", "renderRawRest", "suffix", "component", "itemComponent", "onVisibleChange"];
var RESPONSIVE = "responsive";
var INVALIDATE = "invalidate";
function defaultRenderRest(omittedItems) {
  return "+ ".concat(omittedItems.length, " ...");
}
function Overflow(props, ref) {
  var _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-overflow" : _props$prefixCls, _props$data = props.data, data = _props$data === void 0 ? [] : _props$data, renderItem = props.renderItem, renderRawItem = props.renderRawItem, itemKey = props.itemKey, _props$itemWidth = props.itemWidth, itemWidth = _props$itemWidth === void 0 ? 10 : _props$itemWidth, ssr = props.ssr, style2 = props.style, className = props.className, maxCount = props.maxCount, renderRest = props.renderRest, renderRawRest = props.renderRawRest, suffix = props.suffix, _props$component = props.component, Component6 = _props$component === void 0 ? "div" : _props$component, itemComponent = props.itemComponent, onVisibleChange = props.onVisibleChange, restProps = _objectWithoutProperties(props, _excluded9);
  var fullySSR = ssr === "full";
  var notifyEffectUpdate = useBatcher();
  var _useEffectState = useEffectState(notifyEffectUpdate, null), _useEffectState2 = _slicedToArray(_useEffectState, 2), containerWidth = _useEffectState2[0], setContainerWidth = _useEffectState2[1];
  var mergedContainerWidth = containerWidth || 0;
  var _useEffectState3 = useEffectState(notifyEffectUpdate, /* @__PURE__ */ new Map()), _useEffectState4 = _slicedToArray(_useEffectState3, 2), itemWidths = _useEffectState4[0], setItemWidths = _useEffectState4[1];
  var _useEffectState5 = useEffectState(notifyEffectUpdate, 0), _useEffectState6 = _slicedToArray(_useEffectState5, 2), prevRestWidth = _useEffectState6[0], setPrevRestWidth = _useEffectState6[1];
  var _useEffectState7 = useEffectState(notifyEffectUpdate, 0), _useEffectState8 = _slicedToArray(_useEffectState7, 2), restWidth = _useEffectState8[0], setRestWidth = _useEffectState8[1];
  var _useEffectState9 = useEffectState(notifyEffectUpdate, 0), _useEffectState10 = _slicedToArray(_useEffectState9, 2), suffixWidth = _useEffectState10[0], setSuffixWidth = _useEffectState10[1];
  var _useState = (0, import_react21.useState)(null), _useState2 = _slicedToArray(_useState, 2), suffixFixedStart = _useState2[0], setSuffixFixedStart = _useState2[1];
  var _useState3 = (0, import_react21.useState)(null), _useState4 = _slicedToArray(_useState3, 2), displayCount = _useState4[0], setDisplayCount = _useState4[1];
  var mergedDisplayCount = React65.useMemo(function() {
    if (displayCount === null && fullySSR) {
      return Number.MAX_SAFE_INTEGER;
    }
    return displayCount || 0;
  }, [displayCount, containerWidth]);
  var _useState5 = (0, import_react21.useState)(false), _useState6 = _slicedToArray(_useState5, 2), restReady = _useState6[0], setRestReady = _useState6[1];
  var itemPrefixCls = "".concat(prefixCls, "-item");
  var mergedRestWidth = Math.max(prevRestWidth, restWidth);
  var isResponsive = maxCount === RESPONSIVE;
  var shouldResponsive = data.length && isResponsive;
  var invalidate = maxCount === INVALIDATE;
  var showRest = shouldResponsive || typeof maxCount === "number" && data.length > maxCount;
  var mergedData = (0, import_react21.useMemo)(function() {
    var items = data;
    if (shouldResponsive) {
      if (containerWidth === null && fullySSR) {
        items = data;
      } else {
        items = data.slice(0, Math.min(data.length, mergedContainerWidth / itemWidth));
      }
    } else if (typeof maxCount === "number") {
      items = data.slice(0, maxCount);
    }
    return items;
  }, [data, itemWidth, containerWidth, maxCount, shouldResponsive]);
  var omittedItems = (0, import_react21.useMemo)(function() {
    if (shouldResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, shouldResponsive, mergedDisplayCount]);
  var getKey = (0, import_react21.useCallback)(function(item, index2) {
    var _ref;
    if (typeof itemKey === "function") {
      return itemKey(item);
    }
    return (_ref = itemKey && (item === null || item === void 0 ? void 0 : item[itemKey])) !== null && _ref !== void 0 ? _ref : index2;
  }, [itemKey]);
  var mergedRenderItem = (0, import_react21.useCallback)(renderItem || function(item) {
    return item;
  }, [renderItem]);
  function updateDisplayCount(count, suffixFixedStartVal, notReady) {
    if (displayCount === count && (suffixFixedStartVal === void 0 || suffixFixedStartVal === suffixFixedStart)) {
      return;
    }
    setDisplayCount(count);
    if (!notReady) {
      setRestReady(count < data.length - 1);
      onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(count);
    }
    if (suffixFixedStartVal !== void 0) {
      setSuffixFixedStart(suffixFixedStartVal);
    }
  }
  function onOverflowResize(_, element) {
    setContainerWidth(element.clientWidth);
  }
  function registerSize(key, width) {
    setItemWidths(function(origin) {
      var clone = new Map(origin);
      if (width === null) {
        clone.delete(key);
      } else {
        clone.set(key, width);
      }
      return clone;
    });
  }
  function registerOverflowSize(_, width) {
    setRestWidth(width);
    setPrevRestWidth(restWidth);
  }
  function registerSuffixSize(_, width) {
    setSuffixWidth(width);
  }
  function getItemWidth(index2) {
    return itemWidths.get(getKey(mergedData[index2], index2));
  }
  useLayoutEffect_default(function() {
    if (mergedContainerWidth && typeof mergedRestWidth === "number" && mergedData) {
      var totalWidth = suffixWidth;
      var len = mergedData.length;
      var lastIndex = len - 1;
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }
      for (var i = 0; i < len; i += 1) {
        var currentItemWidth = getItemWidth(i);
        if (fullySSR) {
          currentItemWidth = currentItemWidth || 0;
        }
        if (currentItemWidth === void 0) {
          updateDisplayCount(i - 1, void 0, true);
          break;
        }
        totalWidth += currentItemWidth;
        if (
          // Only one means `totalWidth` is the final width
          lastIndex === 0 && totalWidth <= mergedContainerWidth || // Last two width will be the final width
          i === lastIndex - 1 && totalWidth + getItemWidth(lastIndex) <= mergedContainerWidth
        ) {
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth > mergedContainerWidth) {
          updateDisplayCount(i - 1, totalWidth - currentItemWidth - suffixWidth + restWidth);
          break;
        }
      }
      if (suffix && getItemWidth(0) + suffixWidth > mergedContainerWidth) {
        setSuffixFixedStart(null);
      }
    }
  }, [mergedContainerWidth, itemWidths, restWidth, suffixWidth, getKey, mergedData]);
  var displayRest = restReady && !!omittedItems.length;
  var suffixStyle = {};
  if (suffixFixedStart !== null && shouldResponsive) {
    suffixStyle = {
      position: "absolute",
      left: suffixFixedStart,
      top: 0
    };
  }
  var itemSharedProps = {
    prefixCls: itemPrefixCls,
    responsive: shouldResponsive,
    component: itemComponent,
    invalidate
  };
  var internalRenderItemNode = renderRawItem ? function(item, index2) {
    var key = getKey(item, index2);
    return React65.createElement(OverflowContext.Provider, {
      key,
      value: _objectSpread2(_objectSpread2({}, itemSharedProps), {}, {
        order: index2,
        item,
        itemKey: key,
        registerSize,
        display: index2 <= mergedDisplayCount
      })
    }, renderRawItem(item, index2));
  } : function(item, index2) {
    var key = getKey(item, index2);
    return React65.createElement(Item_default, _extends({}, itemSharedProps, {
      order: index2,
      key,
      item,
      renderItem: mergedRenderItem,
      itemKey: key,
      registerSize,
      display: index2 <= mergedDisplayCount
    }));
  };
  var restContextProps = {
    order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
    className: "".concat(itemPrefixCls, "-rest"),
    registerSize: registerOverflowSize,
    display: displayRest
  };
  var mergedRenderRest = renderRest || defaultRenderRest;
  var restNode = renderRawRest ? React65.createElement(OverflowContext.Provider, {
    value: _objectSpread2(_objectSpread2({}, itemSharedProps), restContextProps)
  }, renderRawRest(omittedItems)) : React65.createElement(Item_default, _extends({}, itemSharedProps, restContextProps), typeof mergedRenderRest === "function" ? mergedRenderRest(omittedItems) : mergedRenderRest);
  var overflowNode = React65.createElement(Component6, _extends({
    className: (0, import_classnames19.default)(!invalidate && prefixCls, className),
    style: style2,
    ref
  }, restProps), mergedData.map(internalRenderItemNode), showRest ? restNode : null, suffix && React65.createElement(Item_default, _extends({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: mergedDisplayCount,
    className: "".concat(itemPrefixCls, "-suffix"),
    registerSize: registerSuffixSize,
    display: true,
    style: suffixStyle
  }), suffix));
  return isResponsive ? React65.createElement(es_default2, {
    onResize: onOverflowResize,
    disabled: !shouldResponsive
  }, overflowNode) : overflowNode;
}
var ForwardOverflow = React65.forwardRef(Overflow);
ForwardOverflow.displayName = "Overflow";
ForwardOverflow.Item = RawItem_default;
ForwardOverflow.RESPONSIVE = RESPONSIVE;
ForwardOverflow.INVALIDATE = INVALIDATE;
var Overflow_default = ForwardOverflow;

// node_modules/rc-overflow/es/index.js
var es_default6 = Overflow_default;

// node_modules/rc-menu/es/Menu.js
var React86 = __toESM(require_react());
var import_react23 = __toESM(require_react());
var import_react_dom4 = __toESM(require_react_dom());

// node_modules/rc-menu/es/context/IdContext.js
var React66 = __toESM(require_react());
var IdContext = React66.createContext(null);
function getMenuId(uuid4, eventKey) {
  if (uuid4 === void 0) {
    return null;
  }
  return "".concat(uuid4, "-").concat(eventKey);
}
function useMenuId(eventKey) {
  var id = React66.useContext(IdContext);
  return getMenuId(id, eventKey);
}

// node_modules/rc-menu/es/context/MenuContext.js
var React67 = __toESM(require_react());
var _excluded10 = ["children", "locked"];
var MenuContext = React67.createContext(null);
function mergeProps(origin, target) {
  var clone = _objectSpread2({}, origin);
  Object.keys(target).forEach(function(key) {
    var value = target[key];
    if (value !== void 0) {
      clone[key] = value;
    }
  });
  return clone;
}
function InheritableContextProvider(_ref) {
  var children = _ref.children, locked = _ref.locked, restProps = _objectWithoutProperties(_ref, _excluded10);
  var context = React67.useContext(MenuContext);
  var inheritableContext = useMemo(function() {
    return mergeProps(context, restProps);
  }, [context, restProps], function(prev, next) {
    return !locked && (prev[0] !== next[0] || !isEqual_default(prev[1], next[1], true));
  });
  return React67.createElement(MenuContext.Provider, {
    value: inheritableContext
  }, children);
}

// node_modules/rc-menu/es/context/PathContext.js
var React68 = __toESM(require_react());
var EmptyList = [];
var PathRegisterContext = React68.createContext(null);
function useMeasure() {
  return React68.useContext(PathRegisterContext);
}
var PathTrackerContext = React68.createContext(EmptyList);
function useFullPath(eventKey) {
  var parentKeyPath = React68.useContext(PathTrackerContext);
  return React68.useMemo(function() {
    return eventKey !== void 0 ? [].concat(_toConsumableArray(parentKeyPath), [eventKey]) : parentKeyPath;
  }, [parentKeyPath, eventKey]);
}
var PathUserContext = React68.createContext(null);

// node_modules/rc-menu/es/context/PrivateContext.js
var React69 = __toESM(require_react());
var PrivateContext = React69.createContext({});
var PrivateContext_default = PrivateContext;

// node_modules/rc-util/es/Dom/focus.js
function focusable(node) {
  var includePositive = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  if (isVisible_default(node)) {
    var nodeName = node.nodeName.toLowerCase();
    var isFocusableElement = (
      // Focusable element
      ["input", "select", "textarea", "button"].includes(nodeName) || // Editable element
      node.isContentEditable || // Anchor with href element
      nodeName === "a" && !!node.getAttribute("href")
    );
    var tabIndexAttr = node.getAttribute("tabindex");
    var tabIndexNum = Number(tabIndexAttr);
    var tabIndex = null;
    if (tabIndexAttr && !Number.isNaN(tabIndexNum)) {
      tabIndex = tabIndexNum;
    } else if (isFocusableElement && tabIndex === null) {
      tabIndex = 0;
    }
    if (isFocusableElement && node.disabled) {
      tabIndex = null;
    }
    return tabIndex !== null && (tabIndex >= 0 || includePositive && tabIndex < 0);
  }
  return false;
}
function getFocusNodeList(node) {
  var includePositive = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  var res = _toConsumableArray(node.querySelectorAll("*")).filter(function(child) {
    return focusable(child, includePositive);
  });
  if (focusable(node, includePositive)) {
    res.unshift(node);
  }
  return res;
}

// node_modules/rc-menu/es/hooks/useAccessibility.js
var React70 = __toESM(require_react());
var LEFT = KeyCode_default.LEFT;
var RIGHT = KeyCode_default.RIGHT;
var UP = KeyCode_default.UP;
var DOWN = KeyCode_default.DOWN;
var ENTER = KeyCode_default.ENTER;
var ESC2 = KeyCode_default.ESC;
var HOME = KeyCode_default.HOME;
var END = KeyCode_default.END;
var ArrowKeys = [UP, DOWN, LEFT, RIGHT];
function getOffset(mode, isRootLevel, isRtl, which) {
  var _offsets;
  var prev = "prev";
  var next = "next";
  var children = "children";
  var parent = "parent";
  if (mode === "inline" && which === ENTER) {
    return {
      inlineTrigger: true
    };
  }
  var inline2 = _defineProperty(_defineProperty({}, UP, prev), DOWN, next);
  var horizontal = _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, LEFT, isRtl ? next : prev), RIGHT, isRtl ? prev : next), DOWN, children), ENTER, children);
  var vertical = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, UP, prev), DOWN, next), ENTER, children), ESC2, parent), LEFT, isRtl ? children : parent), RIGHT, isRtl ? parent : children);
  var offsets = {
    inline: inline2,
    horizontal,
    vertical,
    inlineSub: inline2,
    horizontalSub: vertical,
    verticalSub: vertical
  };
  var type5 = (_offsets = offsets["".concat(mode).concat(isRootLevel ? "" : "Sub")]) === null || _offsets === void 0 ? void 0 : _offsets[which];
  switch (type5) {
    case prev:
      return {
        offset: -1,
        sibling: true
      };
    case next:
      return {
        offset: 1,
        sibling: true
      };
    case parent:
      return {
        offset: -1,
        sibling: false
      };
    case children:
      return {
        offset: 1,
        sibling: false
      };
    default:
      return null;
  }
}
function findContainerUL(element) {
  var current = element;
  while (current) {
    if (current.getAttribute("data-menu-list")) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusElement(activeElement, elements) {
  var current = activeElement || document.activeElement;
  while (current) {
    if (elements.has(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusableElements(container, elements) {
  var list = getFocusNodeList(container, true);
  return list.filter(function(ele) {
    return elements.has(ele);
  });
}
function getNextFocusElement(parentQueryContainer, elements, focusMenuElement) {
  var offset = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
  if (!parentQueryContainer) {
    return null;
  }
  var sameLevelFocusableMenuElementList = getFocusableElements(parentQueryContainer, elements);
  var count = sameLevelFocusableMenuElementList.length;
  var focusIndex = sameLevelFocusableMenuElementList.findIndex(function(ele) {
    return focusMenuElement === ele;
  });
  if (offset < 0) {
    if (focusIndex === -1) {
      focusIndex = count - 1;
    } else {
      focusIndex -= 1;
    }
  } else if (offset > 0) {
    focusIndex += 1;
  }
  focusIndex = (focusIndex + count) % count;
  return sameLevelFocusableMenuElementList[focusIndex];
}
var refreshElements = function refreshElements2(keys, id) {
  var elements = /* @__PURE__ */ new Set();
  var key2element = /* @__PURE__ */ new Map();
  var element2key = /* @__PURE__ */ new Map();
  keys.forEach(function(key) {
    var element = document.querySelector("[data-menu-id='".concat(getMenuId(id, key), "']"));
    if (element) {
      elements.add(element);
      element2key.set(element, key);
      key2element.set(key, element);
    }
  });
  return {
    elements,
    key2element,
    element2key
  };
};
function useAccessibility2(mode, activeKey, isRtl, id, containerRef, getKeys, getKeyPath, triggerActiveKey, triggerAccessibilityOpen, originOnKeyDown) {
  var rafRef = React70.useRef();
  var activeRef = React70.useRef();
  activeRef.current = activeKey;
  var cleanRaf = function cleanRaf2() {
    raf_default.cancel(rafRef.current);
  };
  React70.useEffect(function() {
    return function() {
      cleanRaf();
    };
  }, []);
  return function(e) {
    var which = e.which;
    if ([].concat(ArrowKeys, [ENTER, ESC2, HOME, END]).includes(which)) {
      var keys = getKeys();
      var refreshedElements = refreshElements(keys, id);
      var _refreshedElements = refreshedElements, elements = _refreshedElements.elements, key2element = _refreshedElements.key2element, element2key = _refreshedElements.element2key;
      var activeElement = key2element.get(activeKey);
      var focusMenuElement = getFocusElement(activeElement, elements);
      var focusMenuKey = element2key.get(focusMenuElement);
      var offsetObj = getOffset(mode, getKeyPath(focusMenuKey, true).length === 1, isRtl, which);
      if (!offsetObj && which !== HOME && which !== END) {
        return;
      }
      if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
        e.preventDefault();
      }
      var tryFocus = function tryFocus2(menuElement) {
        if (menuElement) {
          var focusTargetElement = menuElement;
          var link = menuElement.querySelector("a");
          if (link !== null && link !== void 0 && link.getAttribute("href")) {
            focusTargetElement = link;
          }
          var targetKey = element2key.get(menuElement);
          triggerActiveKey(targetKey);
          cleanRaf();
          rafRef.current = raf_default(function() {
            if (activeRef.current === targetKey) {
              focusTargetElement.focus();
            }
          });
        }
      };
      if ([HOME, END].includes(which) || offsetObj.sibling || !focusMenuElement) {
        var parentQueryContainer;
        if (!focusMenuElement || mode === "inline") {
          parentQueryContainer = containerRef.current;
        } else {
          parentQueryContainer = findContainerUL(focusMenuElement);
        }
        var targetElement;
        var focusableElements = getFocusableElements(parentQueryContainer, elements);
        if (which === HOME) {
          targetElement = focusableElements[0];
        } else if (which === END) {
          targetElement = focusableElements[focusableElements.length - 1];
        } else {
          targetElement = getNextFocusElement(parentQueryContainer, elements, focusMenuElement, offsetObj.offset);
        }
        tryFocus(targetElement);
      } else if (offsetObj.inlineTrigger) {
        triggerAccessibilityOpen(focusMenuKey);
      } else if (offsetObj.offset > 0) {
        triggerAccessibilityOpen(focusMenuKey, true);
        cleanRaf();
        rafRef.current = raf_default(function() {
          refreshedElements = refreshElements(keys, id);
          var controlId = focusMenuElement.getAttribute("aria-controls");
          var subQueryContainer = document.getElementById(controlId);
          var targetElement2 = getNextFocusElement(subQueryContainer, refreshedElements.elements);
          tryFocus(targetElement2);
        }, 5);
      } else if (offsetObj.offset < 0) {
        var keyPath = getKeyPath(focusMenuKey, true);
        var parentKey = keyPath[keyPath.length - 2];
        var parentMenuElement = key2element.get(parentKey);
        triggerAccessibilityOpen(parentKey, false);
        tryFocus(parentMenuElement);
      }
    }
    originOnKeyDown === null || originOnKeyDown === void 0 || originOnKeyDown(e);
  };
}

// node_modules/rc-menu/es/hooks/useKeyRecords.js
var React71 = __toESM(require_react());
var import_react22 = __toESM(require_react());

// node_modules/rc-menu/es/utils/timeUtil.js
function nextSlice(callback) {
  Promise.resolve().then(callback);
}

// node_modules/rc-menu/es/hooks/useKeyRecords.js
var PATH_SPLIT = "__RC_UTIL_PATH_SPLIT__";
var getPathStr = function getPathStr2(keyPath) {
  return keyPath.join(PATH_SPLIT);
};
var getPathKeys = function getPathKeys2(keyPathStr) {
  return keyPathStr.split(PATH_SPLIT);
};
var OVERFLOW_KEY = "rc-menu-more";
function useKeyRecords() {
  var _React$useState = React71.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), internalForceUpdate = _React$useState2[1];
  var key2pathRef = (0, import_react22.useRef)(/* @__PURE__ */ new Map());
  var path2keyRef = (0, import_react22.useRef)(/* @__PURE__ */ new Map());
  var _React$useState3 = React71.useState([]), _React$useState4 = _slicedToArray(_React$useState3, 2), overflowKeys = _React$useState4[0], setOverflowKeys = _React$useState4[1];
  var updateRef = (0, import_react22.useRef)(0);
  var destroyRef = (0, import_react22.useRef)(false);
  var forceUpdate = function forceUpdate2() {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  var registerPath = (0, import_react22.useCallback)(function(key, keyPath) {
    if (true) {
      warning_default(!key2pathRef.current.has(key), "Duplicated key '".concat(key, "' used in Menu by path [").concat(keyPath.join(" > "), "]"));
    }
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    var id = updateRef.current;
    nextSlice(function() {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  var unregisterPath = (0, import_react22.useCallback)(function(key, keyPath) {
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  var refreshOverflowKeys = (0, import_react22.useCallback)(function(keys) {
    setOverflowKeys(keys);
  }, []);
  var getKeyPath = (0, import_react22.useCallback)(function(eventKey, includeOverflow) {
    var fullPath = key2pathRef.current.get(eventKey) || "";
    var keys = getPathKeys(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY);
    }
    return keys;
  }, [overflowKeys]);
  var isSubPathKey = (0, import_react22.useCallback)(function(pathKeys, eventKey) {
    return pathKeys.filter(function(item) {
      return item !== void 0;
    }).some(function(pathKey) {
      var pathKeyList = getKeyPath(pathKey, true);
      return pathKeyList.includes(eventKey);
    });
  }, [getKeyPath]);
  var getKeys = function getKeys2() {
    var keys = _toConsumableArray(key2pathRef.current.keys());
    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY);
    }
    return keys;
  };
  var getSubPathKeys = (0, import_react22.useCallback)(function(key) {
    var connectedPath = "".concat(key2pathRef.current.get(key)).concat(PATH_SPLIT);
    var pathKeys = /* @__PURE__ */ new Set();
    _toConsumableArray(path2keyRef.current.keys()).forEach(function(pathKey) {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);
  React71.useEffect(function() {
    return function() {
      destroyRef.current = true;
    };
  }, []);
  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys
  };
}

// node_modules/rc-menu/es/hooks/useMemoCallback.js
var React72 = __toESM(require_react());
function useMemoCallback(func) {
  var funRef = React72.useRef(func);
  funRef.current = func;
  var callback = React72.useCallback(function() {
    var _funRef$current;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return (_funRef$current = funRef.current) === null || _funRef$current === void 0 ? void 0 : _funRef$current.call.apply(_funRef$current, [funRef].concat(args));
  }, []);
  return func ? callback : void 0;
}

// node_modules/rc-menu/es/hooks/useUUID.js
var React73 = __toESM(require_react());
var uniquePrefix = Math.random().toFixed(5).toString().slice(2);
var internalId = 0;
function useUUID(id) {
  var _useMergedState = useMergedState(id, {
    value: id
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), uuid4 = _useMergedState2[0], setUUID = _useMergedState2[1];
  React73.useEffect(function() {
    internalId += 1;
    var newId = false ? "test" : "".concat(uniquePrefix, "-").concat(internalId);
    setUUID("rc-menu-uuid-".concat(newId));
  }, []);
  return uuid4;
}

// node_modules/rc-menu/es/MenuItem.js
var import_classnames20 = __toESM(require_classnames());
var React77 = __toESM(require_react());

// node_modules/rc-menu/es/hooks/useActive.js
var React74 = __toESM(require_react());
function useActive(eventKey, disabled, onMouseEnter, onMouseLeave) {
  var _React$useContext = React74.useContext(MenuContext), activeKey = _React$useContext.activeKey, onActive = _React$useContext.onActive, onInactive = _React$useContext.onInactive;
  var ret = {
    active: activeKey === eventKey
  };
  if (!disabled) {
    ret.onMouseEnter = function(domEvent) {
      onMouseEnter === null || onMouseEnter === void 0 || onMouseEnter({
        key: eventKey,
        domEvent
      });
      onActive(eventKey);
    };
    ret.onMouseLeave = function(domEvent) {
      onMouseLeave === null || onMouseLeave === void 0 || onMouseLeave({
        key: eventKey,
        domEvent
      });
      onInactive(eventKey);
    };
  }
  return ret;
}

// node_modules/rc-menu/es/hooks/useDirectionStyle.js
var React75 = __toESM(require_react());
function useDirectionStyle(level) {
  var _React$useContext = React75.useContext(MenuContext), mode = _React$useContext.mode, rtl = _React$useContext.rtl, inlineIndent = _React$useContext.inlineIndent;
  if (mode !== "inline") {
    return null;
  }
  var len = level;
  return rtl ? {
    paddingRight: len * inlineIndent
  } : {
    paddingLeft: len * inlineIndent
  };
}

// node_modules/rc-menu/es/Icon.js
var React76 = __toESM(require_react());
function Icon2(_ref) {
  var icon = _ref.icon, props = _ref.props, children = _ref.children;
  var iconNode;
  if (icon === null || icon === false) {
    return null;
  }
  if (typeof icon === "function") {
    iconNode = React76.createElement(icon, _objectSpread2({}, props));
  } else if (typeof icon !== "boolean") {
    iconNode = icon;
  }
  return iconNode || children || null;
}

// node_modules/rc-menu/es/utils/warnUtil.js
var _excluded11 = ["item"];
function warnItemProp(_ref) {
  var item = _ref.item, restInfo = _objectWithoutProperties(_ref, _excluded11);
  Object.defineProperty(restInfo, "item", {
    get: function get2() {
      warning_default(false, "`info.item` is deprecated since we will move to function component that not provides React Node instance in future.");
      return item;
    }
  });
  return restInfo;
}

// node_modules/rc-menu/es/MenuItem.js
var _excluded12 = ["title", "attribute", "elementRef"];
var _excluded24 = ["style", "className", "eventKey", "warnKey", "disabled", "itemIcon", "children", "role", "onMouseEnter", "onMouseLeave", "onClick", "onKeyDown", "onFocus"];
var _excluded33 = ["active"];
var LegacyMenuItem = function(_React$Component) {
  _inherits(LegacyMenuItem2, _React$Component);
  var _super = _createSuper(LegacyMenuItem2);
  function LegacyMenuItem2() {
    _classCallCheck(this, LegacyMenuItem2);
    return _super.apply(this, arguments);
  }
  _createClass(LegacyMenuItem2, [{
    key: "render",
    value: function render() {
      var _this$props = this.props, title = _this$props.title, attribute = _this$props.attribute, elementRef = _this$props.elementRef, restProps = _objectWithoutProperties(_this$props, _excluded12);
      var passedProps = omit(restProps, ["eventKey", "popupClassName", "popupOffset", "onTitleClick"]);
      warning_default(!attribute, "`attribute` of Menu.Item is deprecated. Please pass attribute directly.");
      return React77.createElement(es_default6.Item, _extends({}, attribute, {
        title: typeof title === "string" ? title : void 0
      }, passedProps, {
        ref: elementRef
      }));
    }
  }]);
  return LegacyMenuItem2;
}(React77.Component);
var InternalMenuItem = React77.forwardRef(function(props, ref) {
  var style2 = props.style, className = props.className, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, itemIcon = props.itemIcon, children = props.children, role = props.role, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onClick = props.onClick, onKeyDown = props.onKeyDown, onFocus = props.onFocus, restProps = _objectWithoutProperties(props, _excluded24);
  var domDataId = useMenuId(eventKey);
  var _React$useContext = React77.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, onItemClick = _React$useContext.onItemClick, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, contextItemIcon = _React$useContext.itemIcon, selectedKeys = _React$useContext.selectedKeys, onActive = _React$useContext.onActive;
  var _React$useContext2 = React77.useContext(PrivateContext_default), _internalRenderMenuItem = _React$useContext2._internalRenderMenuItem;
  var itemCls = "".concat(prefixCls, "-item");
  var legacyMenuItemRef = React77.useRef();
  var elementRef = React77.useRef();
  var mergedDisabled = contextDisabled || disabled;
  var mergedEleRef = useComposeRef(ref, elementRef);
  var connectedKeys = useFullPath(eventKey);
  if (warnKey) {
    warning_default(false, "MenuItem should not leave undefined `key`.");
  }
  var getEventInfo = function getEventInfo2(e) {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: _toConsumableArray(connectedKeys).reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };
  var mergedItemIcon = itemIcon || contextItemIcon;
  var _useActive = useActive(eventKey, mergedDisabled, onMouseEnter, onMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded33);
  var selected = selectedKeys.includes(eventKey);
  var directionStyle = useDirectionStyle(connectedKeys.length);
  var onInternalClick = function onInternalClick2(e) {
    if (mergedDisabled) {
      return;
    }
    var info = getEventInfo(e);
    onClick === null || onClick === void 0 || onClick(warnItemProp(info));
    onItemClick(info);
  };
  var onInternalKeyDown = function onInternalKeyDown2(e) {
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(e);
    if (e.which === KeyCode_default.ENTER) {
      var info = getEventInfo(e);
      onClick === null || onClick === void 0 || onClick(warnItemProp(info));
      onItemClick(info);
    }
  };
  var onInternalFocus = function onInternalFocus2(e) {
    onActive(eventKey);
    onFocus === null || onFocus === void 0 || onFocus(e);
  };
  var optionRoleProps = {};
  if (props.role === "option") {
    optionRoleProps["aria-selected"] = selected;
  }
  var renderNode = React77.createElement(LegacyMenuItem, _extends({
    ref: legacyMenuItemRef,
    elementRef: mergedEleRef,
    role: role === null ? "none" : role || "menuitem",
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, omit(restProps, ["extra"]), activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: _objectSpread2(_objectSpread2({}, directionStyle), style2),
    className: (0, import_classnames20.default)(itemCls, _defineProperty(_defineProperty(_defineProperty({}, "".concat(itemCls, "-active"), active), "".concat(itemCls, "-selected"), selected), "".concat(itemCls, "-disabled"), mergedDisabled), className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, React77.createElement(Icon2, {
    props: _objectSpread2(_objectSpread2({}, props), {}, {
      isSelected: selected
    }),
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected
    });
  }
  return renderNode;
});
function MenuItem(props, ref) {
  var eventKey = props.eventKey;
  var measure = useMeasure();
  var connectedKeyPath = useFullPath(eventKey);
  React77.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }
  return React77.createElement(InternalMenuItem, _extends({}, props, {
    ref
  }));
}
var MenuItem_default = React77.forwardRef(MenuItem);

// node_modules/rc-menu/es/SubMenu/index.js
var React82 = __toESM(require_react());
var import_classnames23 = __toESM(require_classnames());

// node_modules/rc-menu/es/SubMenu/SubMenuList.js
var React78 = __toESM(require_react());
var import_classnames21 = __toESM(require_classnames());
var _excluded13 = ["className", "children"];
var InternalSubMenuList = function InternalSubMenuList2(_ref, ref) {
  var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded13);
  var _React$useContext = React78.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, rtl = _React$useContext.rtl;
  return React78.createElement("ul", _extends({
    className: (0, import_classnames21.default)(prefixCls, rtl && "".concat(prefixCls, "-rtl"), "".concat(prefixCls, "-sub"), "".concat(prefixCls, "-").concat(mode === "inline" ? "inline" : "vertical"), className),
    role: "menu"
  }, restProps, {
    "data-menu-list": true,
    ref
  }), children);
};
var SubMenuList = React78.forwardRef(InternalSubMenuList);
SubMenuList.displayName = "SubMenuList";
var SubMenuList_default = SubMenuList;

// node_modules/rc-menu/es/utils/commonUtil.js
var React79 = __toESM(require_react());
function parseChildren(children, keyPath) {
  return toArray(children).map(function(child, index2) {
    if (React79.isValidElement(child)) {
      var _eventKey, _child$props;
      var key = child.key;
      var eventKey = (_eventKey = (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.eventKey) !== null && _eventKey !== void 0 ? _eventKey : key;
      var emptyKey = eventKey === null || eventKey === void 0;
      if (emptyKey) {
        eventKey = "tmp_key-".concat([].concat(_toConsumableArray(keyPath), [index2]).join("-"));
      }
      var cloneProps = {
        key: eventKey,
        eventKey
      };
      if (emptyKey) {
        cloneProps.warnKey = true;
      }
      return React79.cloneElement(child, cloneProps);
    }
    return child;
  });
}

// node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var React80 = __toESM(require_react());
var import_classnames22 = __toESM(require_classnames());

// node_modules/rc-menu/es/placements.js
var autoAdjustOverflow2 = {
  adjustX: 1,
  adjustY: 1
};
var placements2 = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow2
  },
  topRight: {
    points: ["br", "tr"],
    overflow: autoAdjustOverflow2
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow2
  },
  bottomRight: {
    points: ["tr", "br"],
    overflow: autoAdjustOverflow2
  },
  leftTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow2
  },
  leftBottom: {
    points: ["br", "bl"],
    overflow: autoAdjustOverflow2
  },
  rightTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow2
  },
  rightBottom: {
    points: ["bl", "br"],
    overflow: autoAdjustOverflow2
  }
};
var placementsRtl = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow2
  },
  topRight: {
    points: ["br", "tr"],
    overflow: autoAdjustOverflow2
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow2
  },
  bottomRight: {
    points: ["tr", "br"],
    overflow: autoAdjustOverflow2
  },
  rightTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow2
  },
  rightBottom: {
    points: ["br", "bl"],
    overflow: autoAdjustOverflow2
  },
  leftTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow2
  },
  leftBottom: {
    points: ["bl", "br"],
    overflow: autoAdjustOverflow2
  }
};

// node_modules/rc-menu/es/utils/motionUtil.js
function getMotion2(mode, motion2, defaultMotions) {
  if (motion2) {
    return motion2;
  }
  if (defaultMotions) {
    return defaultMotions[mode] || defaultMotions.other;
  }
  return void 0;
}

// node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var popupPlacementMap = {
  horizontal: "bottomLeft",
  vertical: "rightTop",
  "vertical-left": "rightTop",
  "vertical-right": "leftTop"
};
function PopupTrigger(_ref) {
  var prefixCls = _ref.prefixCls, visible = _ref.visible, children = _ref.children, popup = _ref.popup, popupStyle = _ref.popupStyle, popupClassName = _ref.popupClassName, popupOffset = _ref.popupOffset, disabled = _ref.disabled, mode = _ref.mode, onVisibleChange = _ref.onVisibleChange;
  var _React$useContext = React80.useContext(MenuContext), getPopupContainer = _React$useContext.getPopupContainer, rtl = _React$useContext.rtl, subMenuOpenDelay = _React$useContext.subMenuOpenDelay, subMenuCloseDelay = _React$useContext.subMenuCloseDelay, builtinPlacements = _React$useContext.builtinPlacements, triggerSubMenuAction = _React$useContext.triggerSubMenuAction, forceSubMenuRender = _React$useContext.forceSubMenuRender, rootClassName = _React$useContext.rootClassName, motion2 = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions;
  var _React$useState = React80.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), innerVisible = _React$useState2[0], setInnerVisible = _React$useState2[1];
  var placement = rtl ? _objectSpread2(_objectSpread2({}, placementsRtl), builtinPlacements) : _objectSpread2(_objectSpread2({}, placements2), builtinPlacements);
  var popupPlacement = popupPlacementMap[mode];
  var targetMotion = getMotion2(mode, motion2, defaultMotions);
  var targetMotionRef = React80.useRef(targetMotion);
  if (mode !== "inline") {
    targetMotionRef.current = targetMotion;
  }
  var mergedMotion = _objectSpread2(_objectSpread2({}, targetMotionRef.current), {}, {
    leavedClassName: "".concat(prefixCls, "-hidden"),
    removeOnLeave: false,
    motionAppear: true
  });
  var visibleRef = React80.useRef();
  React80.useEffect(function() {
    visibleRef.current = raf_default(function() {
      setInnerVisible(visible);
    });
    return function() {
      raf_default.cancel(visibleRef.current);
    };
  }, [visible]);
  return React80.createElement(es_default4, {
    prefixCls,
    popupClassName: (0, import_classnames22.default)("".concat(prefixCls, "-popup"), _defineProperty({}, "".concat(prefixCls, "-rtl"), rtl), popupClassName, rootClassName),
    stretch: mode === "horizontal" ? "minWidth" : null,
    getPopupContainer,
    builtinPlacements: placement,
    popupPlacement,
    popupVisible: innerVisible,
    popup,
    popupStyle,
    popupAlign: popupOffset && {
      offset: popupOffset
    },
    action: disabled ? [] : [triggerSubMenuAction],
    mouseEnterDelay: subMenuOpenDelay,
    mouseLeaveDelay: subMenuCloseDelay,
    onPopupVisibleChange: onVisibleChange,
    forceRender: forceSubMenuRender,
    popupMotion: mergedMotion,
    fresh: true
  }, children);
}

// node_modules/rc-menu/es/SubMenu/InlineSubMenuList.js
var React81 = __toESM(require_react());
function InlineSubMenuList(_ref) {
  var id = _ref.id, open = _ref.open, keyPath = _ref.keyPath, children = _ref.children;
  var fixedMode = "inline";
  var _React$useContext = React81.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, forceSubMenuRender = _React$useContext.forceSubMenuRender, motion2 = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions, mode = _React$useContext.mode;
  var sameModeRef = React81.useRef(false);
  sameModeRef.current = mode === fixedMode;
  var _React$useState = React81.useState(!sameModeRef.current), _React$useState2 = _slicedToArray(_React$useState, 2), destroy = _React$useState2[0], setDestroy = _React$useState2[1];
  var mergedOpen = sameModeRef.current ? open : false;
  React81.useEffect(function() {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);
  var mergedMotion = _objectSpread2({}, getMotion2(fixedMode, motion2, defaultMotions));
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }
  var originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = function(newVisible) {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged === null || originOnVisibleChanged === void 0 ? void 0 : originOnVisibleChanged(newVisible);
  };
  if (destroy) {
    return null;
  }
  return React81.createElement(InheritableContextProvider, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, React81.createElement(es_default, _extends({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: "".concat(prefixCls, "-hidden")
  }), function(_ref2) {
    var motionClassName = _ref2.className, motionStyle = _ref2.style;
    return React81.createElement(SubMenuList_default, {
      id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}

// node_modules/rc-menu/es/SubMenu/index.js
var _excluded14 = ["style", "className", "title", "eventKey", "warnKey", "disabled", "internalPopupClose", "children", "itemIcon", "expandIcon", "popupClassName", "popupOffset", "popupStyle", "onClick", "onMouseEnter", "onMouseLeave", "onTitleClick", "onTitleMouseEnter", "onTitleMouseLeave"];
var _excluded25 = ["active"];
var InternalSubMenu = React82.forwardRef(function(props, ref) {
  var style2 = props.style, className = props.className, title = props.title, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, internalPopupClose = props.internalPopupClose, children = props.children, itemIcon = props.itemIcon, expandIcon = props.expandIcon, popupClassName = props.popupClassName, popupOffset = props.popupOffset, popupStyle = props.popupStyle, onClick = props.onClick, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onTitleClick = props.onTitleClick, onTitleMouseEnter = props.onTitleMouseEnter, onTitleMouseLeave = props.onTitleMouseLeave, restProps = _objectWithoutProperties(props, _excluded14);
  var domDataId = useMenuId(eventKey);
  var _React$useContext = React82.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, openKeys = _React$useContext.openKeys, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, activeKey = _React$useContext.activeKey, selectedKeys = _React$useContext.selectedKeys, contextItemIcon = _React$useContext.itemIcon, contextExpandIcon = _React$useContext.expandIcon, onItemClick = _React$useContext.onItemClick, onOpenChange = _React$useContext.onOpenChange, onActive = _React$useContext.onActive;
  var _React$useContext2 = React82.useContext(PrivateContext_default), _internalRenderSubMenuItem = _React$useContext2._internalRenderSubMenuItem;
  var _React$useContext3 = React82.useContext(PathUserContext), isSubPathKey = _React$useContext3.isSubPathKey;
  var connectedPath = useFullPath();
  var subMenuPrefixCls = "".concat(prefixCls, "-submenu");
  var mergedDisabled = contextDisabled || disabled;
  var elementRef = React82.useRef();
  var popupRef = React82.useRef();
  if (warnKey) {
    warning_default(false, "SubMenu should not leave undefined `key`.");
  }
  var mergedItemIcon = itemIcon !== null && itemIcon !== void 0 ? itemIcon : contextItemIcon;
  var mergedExpandIcon = expandIcon !== null && expandIcon !== void 0 ? expandIcon : contextExpandIcon;
  var originOpen = openKeys.includes(eventKey);
  var open = !overflowDisabled && originOpen;
  var childrenSelected = isSubPathKey(selectedKeys, eventKey);
  var _useActive = useActive(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded25);
  var _React$useState = React82.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), childrenActive = _React$useState2[0], setChildrenActive = _React$useState2[1];
  var triggerChildrenActive = function triggerChildrenActive2(newActive) {
    if (!mergedDisabled) {
      setChildrenActive(newActive);
    }
  };
  var onInternalMouseEnter = function onInternalMouseEnter2(domEvent) {
    triggerChildrenActive(true);
    onMouseEnter === null || onMouseEnter === void 0 || onMouseEnter({
      key: eventKey,
      domEvent
    });
  };
  var onInternalMouseLeave = function onInternalMouseLeave2(domEvent) {
    triggerChildrenActive(false);
    onMouseLeave === null || onMouseLeave === void 0 || onMouseLeave({
      key: eventKey,
      domEvent
    });
  };
  var mergedActive = React82.useMemo(function() {
    if (active) {
      return active;
    }
    if (mode !== "inline") {
      return childrenActive || isSubPathKey([activeKey], eventKey);
    }
    return false;
  }, [mode, active, activeKey, childrenActive, eventKey, isSubPathKey]);
  var directionStyle = useDirectionStyle(connectedPath.length);
  var onInternalTitleClick = function onInternalTitleClick2(e) {
    if (mergedDisabled) {
      return;
    }
    onTitleClick === null || onTitleClick === void 0 || onTitleClick({
      key: eventKey,
      domEvent: e
    });
    if (mode === "inline") {
      onOpenChange(eventKey, !originOpen);
    }
  };
  var onMergedItemClick = useMemoCallback(function(info) {
    onClick === null || onClick === void 0 || onClick(warnItemProp(info));
    onItemClick(info);
  });
  var onPopupVisibleChange = function onPopupVisibleChange2(newVisible) {
    if (mode !== "inline") {
      onOpenChange(eventKey, newVisible);
    }
  };
  var onInternalFocus = function onInternalFocus2() {
    onActive(eventKey);
  };
  var popupId = domDataId && "".concat(domDataId, "-popup");
  var expandIconNode = React82.useMemo(function() {
    return React82.createElement(Icon2, {
      icon: mode !== "horizontal" ? mergedExpandIcon : void 0,
      props: _objectSpread2(_objectSpread2({}, props), {}, {
        isOpen: open,
        // [Legacy] Not sure why need this mark
        isSubMenu: true
      })
    }, React82.createElement("i", {
      className: "".concat(subMenuPrefixCls, "-arrow")
    }));
  }, [mode, mergedExpandIcon, props, open, subMenuPrefixCls]);
  var titleNode = React82.createElement("div", _extends({
    role: "menuitem",
    style: directionStyle,
    className: "".concat(subMenuPrefixCls, "-title"),
    tabIndex: mergedDisabled ? null : -1,
    ref: elementRef,
    title: typeof title === "string" ? title : null,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId,
    "aria-expanded": open,
    "aria-haspopup": true,
    "aria-controls": popupId,
    "aria-disabled": mergedDisabled,
    onClick: onInternalTitleClick,
    onFocus: onInternalFocus
  }, activeProps), title, expandIconNode);
  var triggerModeRef = React82.useRef(mode);
  if (mode !== "inline" && connectedPath.length > 1) {
    triggerModeRef.current = "vertical";
  } else {
    triggerModeRef.current = mode;
  }
  if (!overflowDisabled) {
    var triggerMode = triggerModeRef.current;
    titleNode = React82.createElement(PopupTrigger, {
      mode: triggerMode,
      prefixCls: subMenuPrefixCls,
      visible: !internalPopupClose && open && mode !== "inline",
      popupClassName,
      popupOffset,
      popupStyle,
      popup: React82.createElement(
        InheritableContextProvider,
        {
          mode: triggerMode === "horizontal" ? "vertical" : triggerMode
        },
        React82.createElement(SubMenuList_default, {
          id: popupId,
          ref: popupRef
        }, children)
      ),
      disabled: mergedDisabled,
      onVisibleChange: onPopupVisibleChange
    }, titleNode);
  }
  var listNode = React82.createElement(es_default6.Item, _extends({
    ref,
    role: "none"
  }, restProps, {
    component: "li",
    style: style2,
    className: (0, import_classnames23.default)(subMenuPrefixCls, "".concat(subMenuPrefixCls, "-").concat(mode), className, _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(subMenuPrefixCls, "-open"), open), "".concat(subMenuPrefixCls, "-active"), mergedActive), "".concat(subMenuPrefixCls, "-selected"), childrenSelected), "".concat(subMenuPrefixCls, "-disabled"), mergedDisabled)),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && React82.createElement(InlineSubMenuList, {
    id: popupId,
    open,
    keyPath: connectedPath
  }, children));
  if (_internalRenderSubMenuItem) {
    listNode = _internalRenderSubMenuItem(listNode, props, {
      selected: childrenSelected,
      active: mergedActive,
      open,
      disabled: mergedDisabled
    });
  }
  return React82.createElement(InheritableContextProvider, {
    onItemClick: onMergedItemClick,
    mode: mode === "horizontal" ? "vertical" : mode,
    itemIcon: mergedItemIcon,
    expandIcon: mergedExpandIcon
  }, listNode);
});
var SubMenu = React82.forwardRef(function(props, ref) {
  var eventKey = props.eventKey, children = props.children;
  var connectedKeyPath = useFullPath(eventKey);
  var childList = parseChildren(children, connectedKeyPath);
  var measure = useMeasure();
  React82.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  var renderNode;
  if (measure) {
    renderNode = childList;
  } else {
    renderNode = React82.createElement(InternalSubMenu, _extends({
      ref
    }, props), childList);
  }
  return React82.createElement(PathTrackerContext.Provider, {
    value: connectedKeyPath
  }, renderNode);
});
if (true) {
  SubMenu.displayName = "SubMenu";
}
var SubMenu_default = SubMenu;

// node_modules/rc-menu/es/utils/nodeUtil.js
var React85 = __toESM(require_react());

// node_modules/rc-menu/es/Divider.js
var React83 = __toESM(require_react());
var import_classnames24 = __toESM(require_classnames());
function Divider(_ref) {
  var className = _ref.className, style2 = _ref.style;
  var _React$useContext = React83.useContext(MenuContext), prefixCls = _React$useContext.prefixCls;
  var measure = useMeasure();
  if (measure) {
    return null;
  }
  return React83.createElement("li", {
    role: "separator",
    className: (0, import_classnames24.default)("".concat(prefixCls, "-item-divider"), className),
    style: style2
  });
}

// node_modules/rc-menu/es/MenuItemGroup.js
var import_classnames25 = __toESM(require_classnames());
var React84 = __toESM(require_react());
var _excluded15 = ["className", "title", "eventKey", "children"];
var InternalMenuItemGroup = React84.forwardRef(function(props, ref) {
  var className = props.className, title = props.title, eventKey = props.eventKey, children = props.children, restProps = _objectWithoutProperties(props, _excluded15);
  var _React$useContext = React84.useContext(MenuContext), prefixCls = _React$useContext.prefixCls;
  var groupPrefixCls = "".concat(prefixCls, "-item-group");
  return React84.createElement("li", _extends({
    ref,
    role: "presentation"
  }, restProps, {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    className: (0, import_classnames25.default)(groupPrefixCls, className)
  }), React84.createElement("div", {
    role: "presentation",
    className: "".concat(groupPrefixCls, "-title"),
    title: typeof title === "string" ? title : void 0
  }, title), React84.createElement("ul", {
    role: "group",
    className: "".concat(groupPrefixCls, "-list")
  }, children));
});
var MenuItemGroup = React84.forwardRef(function(props, ref) {
  var eventKey = props.eventKey, children = props.children;
  var connectedKeyPath = useFullPath(eventKey);
  var childList = parseChildren(children, connectedKeyPath);
  var measure = useMeasure();
  if (measure) {
    return childList;
  }
  return React84.createElement(InternalMenuItemGroup, _extends({
    ref
  }, omit(props, ["warnKey"])), childList);
});
if (true) {
  MenuItemGroup.displayName = "MenuItemGroup";
}
var MenuItemGroup_default = MenuItemGroup;

// node_modules/rc-menu/es/utils/nodeUtil.js
var _excluded16 = ["label", "children", "key", "type", "extra"];
function convertItemsToNodes(list, components, prefixCls) {
  var MergedMenuItem = components.item, MergedMenuItemGroup = components.group, MergedSubMenu = components.submenu, MergedDivider = components.divider;
  return (list || []).map(function(opt, index2) {
    if (opt && _typeof(opt) === "object") {
      var _ref = opt, label = _ref.label, children = _ref.children, key = _ref.key, type5 = _ref.type, extra = _ref.extra, restProps = _objectWithoutProperties(_ref, _excluded16);
      var mergedKey = key !== null && key !== void 0 ? key : "tmp-".concat(index2);
      if (children || type5 === "group") {
        if (type5 === "group") {
          return React85.createElement(MergedMenuItemGroup, _extends({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes(children, components, prefixCls));
        }
        return React85.createElement(MergedSubMenu, _extends({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes(children, components, prefixCls));
      }
      if (type5 === "divider") {
        return React85.createElement(MergedDivider, _extends({
          key: mergedKey
        }, restProps));
      }
      return React85.createElement(MergedMenuItem, _extends({
        key: mergedKey
      }, restProps, {
        extra
      }), label, (!!extra || extra === 0) && React85.createElement("span", {
        className: "".concat(prefixCls, "-item-extra")
      }, extra));
    }
    return null;
  }).filter(function(opt) {
    return opt;
  });
}
function parseItems(children, items, keyPath, components, prefixCls) {
  var childNodes = children;
  var mergedComponents = _objectSpread2({
    divider: Divider,
    item: MenuItem_default,
    group: MenuItemGroup_default,
    submenu: SubMenu_default
  }, components);
  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls);
  }
  return parseChildren(childNodes, keyPath);
}

// node_modules/rc-menu/es/Menu.js
var _excluded17 = ["prefixCls", "rootClassName", "style", "className", "tabIndex", "items", "children", "direction", "id", "mode", "inlineCollapsed", "disabled", "disabledOverflow", "subMenuOpenDelay", "subMenuCloseDelay", "forceSubMenuRender", "defaultOpenKeys", "openKeys", "activeKey", "defaultActiveFirst", "selectable", "multiple", "defaultSelectedKeys", "selectedKeys", "onSelect", "onDeselect", "inlineIndent", "motion", "defaultMotions", "triggerSubMenuAction", "builtinPlacements", "itemIcon", "expandIcon", "overflowedIndicator", "overflowedIndicatorPopupClassName", "getPopupContainer", "onClick", "onOpenChange", "onKeyDown", "openAnimation", "openTransitionName", "_internalRenderMenuItem", "_internalRenderSubMenuItem", "_internalComponents"];
var EMPTY_LIST2 = [];
var Menu = React86.forwardRef(function(props, ref) {
  var _childList$;
  var _ref = props, _ref$prefixCls = _ref.prefixCls, prefixCls = _ref$prefixCls === void 0 ? "rc-menu" : _ref$prefixCls, rootClassName = _ref.rootClassName, style2 = _ref.style, className = _ref.className, _ref$tabIndex = _ref.tabIndex, tabIndex = _ref$tabIndex === void 0 ? 0 : _ref$tabIndex, items = _ref.items, children = _ref.children, direction = _ref.direction, id = _ref.id, _ref$mode = _ref.mode, mode = _ref$mode === void 0 ? "vertical" : _ref$mode, inlineCollapsed = _ref.inlineCollapsed, disabled = _ref.disabled, disabledOverflow = _ref.disabledOverflow, _ref$subMenuOpenDelay = _ref.subMenuOpenDelay, subMenuOpenDelay = _ref$subMenuOpenDelay === void 0 ? 0.1 : _ref$subMenuOpenDelay, _ref$subMenuCloseDela = _ref.subMenuCloseDelay, subMenuCloseDelay = _ref$subMenuCloseDela === void 0 ? 0.1 : _ref$subMenuCloseDela, forceSubMenuRender = _ref.forceSubMenuRender, defaultOpenKeys = _ref.defaultOpenKeys, openKeys = _ref.openKeys, activeKey = _ref.activeKey, defaultActiveFirst = _ref.defaultActiveFirst, _ref$selectable = _ref.selectable, selectable = _ref$selectable === void 0 ? true : _ref$selectable, _ref$multiple = _ref.multiple, multiple = _ref$multiple === void 0 ? false : _ref$multiple, defaultSelectedKeys = _ref.defaultSelectedKeys, selectedKeys = _ref.selectedKeys, onSelect = _ref.onSelect, onDeselect = _ref.onDeselect, _ref$inlineIndent = _ref.inlineIndent, inlineIndent = _ref$inlineIndent === void 0 ? 24 : _ref$inlineIndent, motion2 = _ref.motion, defaultMotions = _ref.defaultMotions, _ref$triggerSubMenuAc = _ref.triggerSubMenuAction, triggerSubMenuAction = _ref$triggerSubMenuAc === void 0 ? "hover" : _ref$triggerSubMenuAc, builtinPlacements = _ref.builtinPlacements, itemIcon = _ref.itemIcon, expandIcon = _ref.expandIcon, _ref$overflowedIndica = _ref.overflowedIndicator, overflowedIndicator = _ref$overflowedIndica === void 0 ? "..." : _ref$overflowedIndica, overflowedIndicatorPopupClassName = _ref.overflowedIndicatorPopupClassName, getPopupContainer = _ref.getPopupContainer, onClick = _ref.onClick, onOpenChange = _ref.onOpenChange, onKeyDown = _ref.onKeyDown, openAnimation = _ref.openAnimation, openTransitionName = _ref.openTransitionName, _internalRenderMenuItem = _ref._internalRenderMenuItem, _internalRenderSubMenuItem = _ref._internalRenderSubMenuItem, _internalComponents = _ref._internalComponents, restProps = _objectWithoutProperties(_ref, _excluded17);
  var _React$useMemo = React86.useMemo(function() {
    return [parseItems(children, items, EMPTY_LIST2, _internalComponents, prefixCls), parseItems(children, items, EMPTY_LIST2, {}, prefixCls)];
  }, [children, items, _internalComponents]), _React$useMemo2 = _slicedToArray(_React$useMemo, 2), childList = _React$useMemo2[0], measureChildList = _React$useMemo2[1];
  var _React$useState = React86.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), mounted = _React$useState2[0], setMounted = _React$useState2[1];
  var containerRef = React86.useRef();
  var uuid4 = useUUID(id);
  var isRtl = direction === "rtl";
  if (true) {
    warning_default(!openAnimation && !openTransitionName, "`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.");
  }
  var _useMergedState = useMergedState(defaultOpenKeys, {
    value: openKeys,
    postState: function postState(keys) {
      return keys || EMPTY_LIST2;
    }
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedOpenKeys = _useMergedState2[0], setMergedOpenKeys = _useMergedState2[1];
  var triggerOpenKeys = function triggerOpenKeys2(keys) {
    var forceFlush = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    function doUpdate() {
      setMergedOpenKeys(keys);
      onOpenChange === null || onOpenChange === void 0 || onOpenChange(keys);
    }
    if (forceFlush) {
      (0, import_react_dom4.flushSync)(doUpdate);
    } else {
      doUpdate();
    }
  };
  var _React$useState3 = React86.useState(mergedOpenKeys), _React$useState4 = _slicedToArray(_React$useState3, 2), inlineCacheOpenKeys = _React$useState4[0], setInlineCacheOpenKeys = _React$useState4[1];
  var mountRef = React86.useRef(false);
  var _React$useMemo3 = React86.useMemo(function() {
    if ((mode === "inline" || mode === "vertical") && inlineCollapsed) {
      return ["vertical", inlineCollapsed];
    }
    return [mode, false];
  }, [mode, inlineCollapsed]), _React$useMemo4 = _slicedToArray(_React$useMemo3, 2), mergedMode = _React$useMemo4[0], mergedInlineCollapsed = _React$useMemo4[1];
  var isInlineMode = mergedMode === "inline";
  var _React$useState5 = React86.useState(mergedMode), _React$useState6 = _slicedToArray(_React$useState5, 2), internalMode = _React$useState6[0], setInternalMode = _React$useState6[1];
  var _React$useState7 = React86.useState(mergedInlineCollapsed), _React$useState8 = _slicedToArray(_React$useState7, 2), internalInlineCollapsed = _React$useState8[0], setInternalInlineCollapsed = _React$useState8[1];
  React86.useEffect(function() {
    setInternalMode(mergedMode);
    setInternalInlineCollapsed(mergedInlineCollapsed);
    if (!mountRef.current) {
      return;
    }
    if (isInlineMode) {
      setMergedOpenKeys(inlineCacheOpenKeys);
    } else {
      triggerOpenKeys(EMPTY_LIST2);
    }
  }, [mergedMode, mergedInlineCollapsed]);
  var _React$useState9 = React86.useState(0), _React$useState10 = _slicedToArray(_React$useState9, 2), lastVisibleIndex = _React$useState10[0], setLastVisibleIndex = _React$useState10[1];
  var allVisible = lastVisibleIndex >= childList.length - 1 || internalMode !== "horizontal" || disabledOverflow;
  React86.useEffect(function() {
    if (isInlineMode) {
      setInlineCacheOpenKeys(mergedOpenKeys);
    }
  }, [mergedOpenKeys]);
  React86.useEffect(function() {
    mountRef.current = true;
    return function() {
      mountRef.current = false;
    };
  }, []);
  var _useKeyRecords = useKeyRecords(), registerPath = _useKeyRecords.registerPath, unregisterPath = _useKeyRecords.unregisterPath, refreshOverflowKeys = _useKeyRecords.refreshOverflowKeys, isSubPathKey = _useKeyRecords.isSubPathKey, getKeyPath = _useKeyRecords.getKeyPath, getKeys = _useKeyRecords.getKeys, getSubPathKeys = _useKeyRecords.getSubPathKeys;
  var registerPathContext = React86.useMemo(function() {
    return {
      registerPath,
      unregisterPath
    };
  }, [registerPath, unregisterPath]);
  var pathUserContext = React86.useMemo(function() {
    return {
      isSubPathKey
    };
  }, [isSubPathKey]);
  React86.useEffect(function() {
    refreshOverflowKeys(allVisible ? EMPTY_LIST2 : childList.slice(lastVisibleIndex + 1).map(function(child) {
      return child.key;
    }));
  }, [lastVisibleIndex, allVisible]);
  var _useMergedState3 = useMergedState(activeKey || defaultActiveFirst && ((_childList$ = childList[0]) === null || _childList$ === void 0 ? void 0 : _childList$.key), {
    value: activeKey
  }), _useMergedState4 = _slicedToArray(_useMergedState3, 2), mergedActiveKey = _useMergedState4[0], setMergedActiveKey = _useMergedState4[1];
  var onActive = useMemoCallback(function(key) {
    setMergedActiveKey(key);
  });
  var onInactive = useMemoCallback(function() {
    setMergedActiveKey(void 0);
  });
  (0, import_react23.useImperativeHandle)(ref, function() {
    return {
      list: containerRef.current,
      focus: function focus(options) {
        var _childList$find;
        var keys = getKeys();
        var _refreshElements = refreshElements(keys, uuid4), elements = _refreshElements.elements, key2element = _refreshElements.key2element, element2key = _refreshElements.element2key;
        var focusableElements = getFocusableElements(containerRef.current, elements);
        var shouldFocusKey = mergedActiveKey !== null && mergedActiveKey !== void 0 ? mergedActiveKey : focusableElements[0] ? element2key.get(focusableElements[0]) : (_childList$find = childList.find(function(node) {
          return !node.props.disabled;
        })) === null || _childList$find === void 0 ? void 0 : _childList$find.key;
        var elementToFocus = key2element.get(shouldFocusKey);
        if (shouldFocusKey && elementToFocus) {
          var _elementToFocus$focus;
          elementToFocus === null || elementToFocus === void 0 || (_elementToFocus$focus = elementToFocus.focus) === null || _elementToFocus$focus === void 0 || _elementToFocus$focus.call(elementToFocus, options);
        }
      }
    };
  });
  var _useMergedState5 = useMergedState(defaultSelectedKeys || [], {
    value: selectedKeys,
    // Legacy convert key to array
    postState: function postState(keys) {
      if (Array.isArray(keys)) {
        return keys;
      }
      if (keys === null || keys === void 0) {
        return EMPTY_LIST2;
      }
      return [keys];
    }
  }), _useMergedState6 = _slicedToArray(_useMergedState5, 2), mergedSelectKeys = _useMergedState6[0], setMergedSelectKeys = _useMergedState6[1];
  var triggerSelection = function triggerSelection2(info) {
    if (selectable) {
      var targetKey = info.key;
      var exist = mergedSelectKeys.includes(targetKey);
      var newSelectKeys;
      if (multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys.filter(function(key) {
            return key !== targetKey;
          });
        } else {
          newSelectKeys = [].concat(_toConsumableArray(mergedSelectKeys), [targetKey]);
        }
      } else {
        newSelectKeys = [targetKey];
      }
      setMergedSelectKeys(newSelectKeys);
      var selectInfo = _objectSpread2(_objectSpread2({}, info), {}, {
        selectedKeys: newSelectKeys
      });
      if (exist) {
        onDeselect === null || onDeselect === void 0 || onDeselect(selectInfo);
      } else {
        onSelect === null || onSelect === void 0 || onSelect(selectInfo);
      }
    }
    if (!multiple && mergedOpenKeys.length && internalMode !== "inline") {
      triggerOpenKeys(EMPTY_LIST2);
    }
  };
  var onInternalClick = useMemoCallback(function(info) {
    onClick === null || onClick === void 0 || onClick(warnItemProp(info));
    triggerSelection(info);
  });
  var onInternalOpenChange = useMemoCallback(function(key, open) {
    var newOpenKeys = mergedOpenKeys.filter(function(k) {
      return k !== key;
    });
    if (open) {
      newOpenKeys.push(key);
    } else if (internalMode !== "inline") {
      var subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(function(k) {
        return !subPathKeys.has(k);
      });
    }
    if (!isEqual_default(mergedOpenKeys, newOpenKeys, true)) {
      triggerOpenKeys(newOpenKeys, true);
    }
  });
  var triggerAccessibilityOpen = function triggerAccessibilityOpen2(key, open) {
    var nextOpen = open !== null && open !== void 0 ? open : !mergedOpenKeys.includes(key);
    onInternalOpenChange(key, nextOpen);
  };
  var onInternalKeyDown = useAccessibility2(internalMode, mergedActiveKey, isRtl, uuid4, containerRef, getKeys, getKeyPath, setMergedActiveKey, triggerAccessibilityOpen, onKeyDown);
  React86.useEffect(function() {
    setMounted(true);
  }, []);
  var privateContext = React86.useMemo(function() {
    return {
      _internalRenderMenuItem,
      _internalRenderSubMenuItem
    };
  }, [_internalRenderMenuItem, _internalRenderSubMenuItem]);
  var wrappedChildList = internalMode !== "horizontal" || disabledOverflow ? childList : (
    // Need wrap for overflow dropdown that do not response for open
    childList.map(function(child, index2) {
      return (
        // Always wrap provider to avoid sub node re-mount
        React86.createElement(InheritableContextProvider, {
          key: child.key,
          overflowDisabled: index2 > lastVisibleIndex
        }, child)
      );
    })
  );
  var container = React86.createElement(es_default6, _extends({
    id,
    ref: containerRef,
    prefixCls: "".concat(prefixCls, "-overflow"),
    component: "ul",
    itemComponent: MenuItem_default,
    className: (0, import_classnames26.default)(prefixCls, "".concat(prefixCls, "-root"), "".concat(prefixCls, "-").concat(internalMode), className, _defineProperty(_defineProperty({}, "".concat(prefixCls, "-inline-collapsed"), internalInlineCollapsed), "".concat(prefixCls, "-rtl"), isRtl), rootClassName),
    dir: direction,
    style: style2,
    role: "menu",
    tabIndex,
    data: wrappedChildList,
    renderRawItem: function renderRawItem(node) {
      return node;
    },
    renderRawRest: function renderRawRest(omitItems) {
      var len = omitItems.length;
      var originOmitItems = len ? childList.slice(-len) : null;
      return React86.createElement(SubMenu_default, {
        eventKey: OVERFLOW_KEY,
        title: overflowedIndicator,
        disabled: allVisible,
        internalPopupClose: len === 0,
        popupClassName: overflowedIndicatorPopupClassName
      }, originOmitItems);
    },
    maxCount: internalMode !== "horizontal" || disabledOverflow ? es_default6.INVALIDATE : es_default6.RESPONSIVE,
    ssr: "full",
    "data-menu-list": true,
    onVisibleChange: function onVisibleChange(newLastIndex) {
      setLastVisibleIndex(newLastIndex);
    },
    onKeyDown: onInternalKeyDown
  }, restProps));
  return React86.createElement(PrivateContext_default.Provider, {
    value: privateContext
  }, React86.createElement(IdContext.Provider, {
    value: uuid4
  }, React86.createElement(InheritableContextProvider, {
    prefixCls,
    rootClassName,
    mode: internalMode,
    openKeys: mergedOpenKeys,
    rtl: isRtl,
    disabled,
    motion: mounted ? motion2 : null,
    defaultMotions: mounted ? defaultMotions : null,
    activeKey: mergedActiveKey,
    onActive,
    onInactive,
    selectedKeys: mergedSelectKeys,
    inlineIndent,
    subMenuOpenDelay,
    subMenuCloseDelay,
    forceSubMenuRender,
    builtinPlacements,
    triggerSubMenuAction,
    getPopupContainer,
    itemIcon,
    expandIcon,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange
  }, React86.createElement(PathUserContext.Provider, {
    value: pathUserContext
  }, container), React86.createElement("div", {
    style: {
      display: "none"
    },
    "aria-hidden": true
  }, React86.createElement(PathRegisterContext.Provider, {
    value: registerPathContext
  }, measureChildList)))));
});
var Menu_default = Menu;

// node_modules/rc-menu/es/index.js
var ExportMenu = Menu_default;
ExportMenu.Item = MenuItem_default;
ExportMenu.SubMenu = SubMenu_default;
ExportMenu.ItemGroup = MenuItemGroup_default;
ExportMenu.Divider = Divider;
var es_default7 = ExportMenu;

// node_modules/rc-tabs/es/TabNavList/OperationNode.js
var React87 = __toESM(require_react());
var import_react24 = __toESM(require_react());
var OperationNode = React87.forwardRef(function(props, ref) {
  var prefixCls = props.prefixCls, id = props.id, tabs = props.tabs, locale5 = props.locale, mobile = props.mobile, _props$more = props.more, moreProps = _props$more === void 0 ? {} : _props$more, style2 = props.style, className = props.className, editable = props.editable, tabBarGutter = props.tabBarGutter, rtl = props.rtl, removeAriaLabel = props.removeAriaLabel, onTabClick = props.onTabClick, getPopupContainer = props.getPopupContainer, popupClassName = props.popupClassName;
  var _useState = (0, import_react24.useState)(false), _useState2 = _slicedToArray(_useState, 2), open = _useState2[0], setOpen = _useState2[1];
  var _useState3 = (0, import_react24.useState)(null), _useState4 = _slicedToArray(_useState3, 2), selectedKey = _useState4[0], setSelectedKey = _useState4[1];
  var _moreProps$icon = moreProps.icon, moreIcon = _moreProps$icon === void 0 ? "More" : _moreProps$icon;
  var popupId = "".concat(id, "-more-popup");
  var dropdownPrefix = "".concat(prefixCls, "-dropdown");
  var selectedItemId = selectedKey !== null ? "".concat(popupId, "-").concat(selectedKey) : null;
  var dropdownAriaLabel = locale5 === null || locale5 === void 0 ? void 0 : locale5.dropdownAriaLabel;
  function onRemoveTab(event, key) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit("remove", {
      key,
      event
    });
  }
  var menu = React87.createElement(es_default7, {
    onClick: function onClick(_ref) {
      var key = _ref.key, domEvent = _ref.domEvent;
      onTabClick(key, domEvent);
      setOpen(false);
    },
    prefixCls: "".concat(dropdownPrefix, "-menu"),
    id: popupId,
    tabIndex: -1,
    role: "listbox",
    "aria-activedescendant": selectedItemId,
    selectedKeys: [selectedKey],
    "aria-label": dropdownAriaLabel !== void 0 ? dropdownAriaLabel : "expanded dropdown"
  }, tabs.map(function(tab) {
    var closable = tab.closable, disabled = tab.disabled, closeIcon = tab.closeIcon, key = tab.key, label = tab.label;
    var removable = getRemovable(closable, closeIcon, editable, disabled);
    return React87.createElement(MenuItem_default, {
      key,
      id: "".concat(popupId, "-").concat(key),
      role: "option",
      "aria-controls": id && "".concat(id, "-panel-").concat(key),
      disabled
    }, React87.createElement("span", null, label), removable && React87.createElement("button", {
      type: "button",
      "aria-label": removeAriaLabel || "remove",
      tabIndex: 0,
      className: "".concat(dropdownPrefix, "-menu-item-remove"),
      onClick: function onClick(e) {
        e.stopPropagation();
        onRemoveTab(e, key);
      }
    }, closeIcon || editable.removeIcon || "×"));
  }));
  function selectOffset(offset) {
    var enabledTabs = tabs.filter(function(tab2) {
      return !tab2.disabled;
    });
    var selectedIndex = enabledTabs.findIndex(function(tab2) {
      return tab2.key === selectedKey;
    }) || 0;
    var len = enabledTabs.length;
    for (var i = 0; i < len; i += 1) {
      selectedIndex = (selectedIndex + offset + len) % len;
      var tab = enabledTabs[selectedIndex];
      if (!tab.disabled) {
        setSelectedKey(tab.key);
        return;
      }
    }
  }
  function onKeyDown(e) {
    var which = e.which;
    if (!open) {
      if ([KeyCode_default.DOWN, KeyCode_default.SPACE, KeyCode_default.ENTER].includes(which)) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (which) {
      case KeyCode_default.UP:
        selectOffset(-1);
        e.preventDefault();
        break;
      case KeyCode_default.DOWN:
        selectOffset(1);
        e.preventDefault();
        break;
      case KeyCode_default.ESC:
        setOpen(false);
        break;
      case KeyCode_default.SPACE:
      case KeyCode_default.ENTER:
        if (selectedKey !== null) {
          onTabClick(selectedKey, e);
        }
        break;
    }
  }
  (0, import_react24.useEffect)(function() {
    var ele = document.getElementById(selectedItemId);
    if (ele && ele.scrollIntoView) {
      ele.scrollIntoView(false);
    }
  }, [selectedKey]);
  (0, import_react24.useEffect)(function() {
    if (!open) {
      setSelectedKey(null);
    }
  }, [open]);
  var moreStyle = _defineProperty({}, rtl ? "marginRight" : "marginLeft", tabBarGutter);
  if (!tabs.length) {
    moreStyle.visibility = "hidden";
    moreStyle.order = 1;
  }
  var overlayClassName = (0, import_classnames27.default)(_defineProperty({}, "".concat(dropdownPrefix, "-rtl"), rtl));
  var moreNode = mobile ? null : React87.createElement(es_default5, _extends({
    prefixCls: dropdownPrefix,
    overlay: menu,
    visible: tabs.length ? open : false,
    onVisibleChange: setOpen,
    overlayClassName: (0, import_classnames27.default)(overlayClassName, popupClassName),
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    getPopupContainer
  }, moreProps), React87.createElement("button", {
    type: "button",
    className: "".concat(prefixCls, "-nav-more"),
    style: moreStyle,
    "aria-haspopup": "listbox",
    "aria-controls": popupId,
    id: "".concat(id, "-more"),
    "aria-expanded": open,
    onKeyDown
  }, moreIcon));
  return React87.createElement("div", {
    className: (0, import_classnames27.default)("".concat(prefixCls, "-nav-operations"), className),
    style: style2,
    ref
  }, moreNode, React87.createElement(AddButton_default, {
    prefixCls,
    locale: locale5,
    editable
  }));
});
var OperationNode_default = React87.memo(OperationNode, function(_, next) {
  return (
    // https://github.com/ant-design/ant-design/issues/32544
    // We'd better remove syntactic sugar in `rc-menu` since this has perf issue
    next.tabMoving
  );
});

// node_modules/rc-tabs/es/TabNavList/TabNode.js
var import_classnames28 = __toESM(require_classnames());
var React88 = __toESM(require_react());
var TabNode = function TabNode2(props) {
  var prefixCls = props.prefixCls, id = props.id, active = props.active, focus = props.focus, _props$tab = props.tab, key = _props$tab.key, label = _props$tab.label, disabled = _props$tab.disabled, closeIcon = _props$tab.closeIcon, icon = _props$tab.icon, closable = props.closable, renderWrapper = props.renderWrapper, removeAriaLabel = props.removeAriaLabel, editable = props.editable, onClick = props.onClick, onFocus = props.onFocus, onBlur = props.onBlur, onKeyDown = props.onKeyDown, onMouseDown = props.onMouseDown, onMouseUp = props.onMouseUp, style2 = props.style, tabCount = props.tabCount, currentPosition = props.currentPosition;
  var tabPrefix = "".concat(prefixCls, "-tab");
  var removable = getRemovable(closable, closeIcon, editable, disabled);
  function onInternalClick(e) {
    if (disabled) {
      return;
    }
    onClick(e);
  }
  function onRemoveTab(event) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit("remove", {
      key,
      event
    });
  }
  var labelNode = React88.useMemo(function() {
    return icon && typeof label === "string" ? React88.createElement("span", null, label) : label;
  }, [label, icon]);
  var btnRef = React88.useRef(null);
  React88.useEffect(function() {
    if (focus && btnRef.current) {
      btnRef.current.focus();
    }
  }, [focus]);
  var node = React88.createElement("div", {
    key,
    "data-node-key": genDataNodeKey(key),
    className: (0, import_classnames28.default)(tabPrefix, _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(tabPrefix, "-with-remove"), removable), "".concat(tabPrefix, "-active"), active), "".concat(tabPrefix, "-disabled"), disabled), "".concat(tabPrefix, "-focus"), focus)),
    style: style2,
    onClick: onInternalClick
  }, React88.createElement("div", {
    ref: btnRef,
    role: "tab",
    "aria-selected": active,
    id: id && "".concat(id, "-tab-").concat(key),
    className: "".concat(tabPrefix, "-btn"),
    "aria-controls": id && "".concat(id, "-panel-").concat(key),
    "aria-disabled": disabled,
    tabIndex: disabled ? null : active ? 0 : -1,
    onClick: function onClick2(e) {
      e.stopPropagation();
      onInternalClick(e);
    },
    onKeyDown,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur
  }, focus && React88.createElement("div", {
    "aria-live": "polite",
    style: {
      width: 0,
      height: 0,
      position: "absolute",
      overflow: "hidden",
      opacity: 0
    }
  }, "Tab ".concat(currentPosition, " of ").concat(tabCount)), icon && React88.createElement("span", {
    className: "".concat(tabPrefix, "-icon")
  }, icon), label && labelNode), removable && React88.createElement("button", {
    type: "button",
    role: "tab",
    "aria-label": removeAriaLabel || "remove",
    tabIndex: active ? 0 : -1,
    className: "".concat(tabPrefix, "-remove"),
    onClick: function onClick2(e) {
      e.stopPropagation();
      onRemoveTab(e);
    }
  }, closeIcon || editable.removeIcon || "×"));
  return renderWrapper ? renderWrapper(node) : node;
};
var TabNode_default = TabNode;

// node_modules/rc-tabs/es/TabNavList/index.js
var getTabSize = function getTabSize2(tab, containerRect) {
  var offsetWidth = tab.offsetWidth, offsetHeight = tab.offsetHeight, offsetTop = tab.offsetTop, offsetLeft = tab.offsetLeft;
  var _tab$getBoundingClien = tab.getBoundingClientRect(), width = _tab$getBoundingClien.width, height = _tab$getBoundingClien.height, left = _tab$getBoundingClien.left, top = _tab$getBoundingClien.top;
  if (Math.abs(width - offsetWidth) < 1) {
    return [width, height, left - containerRect.left, top - containerRect.top];
  }
  return [offsetWidth, offsetHeight, offsetLeft, offsetTop];
};
var getSize = function getSize2(refObj) {
  var _ref = refObj.current || {}, _ref$offsetWidth = _ref.offsetWidth, offsetWidth = _ref$offsetWidth === void 0 ? 0 : _ref$offsetWidth, _ref$offsetHeight = _ref.offsetHeight, offsetHeight = _ref$offsetHeight === void 0 ? 0 : _ref$offsetHeight;
  if (refObj.current) {
    var _refObj$current$getBo = refObj.current.getBoundingClientRect(), width = _refObj$current$getBo.width, height = _refObj$current$getBo.height;
    if (Math.abs(width - offsetWidth) < 1) {
      return [width, height];
    }
  }
  return [offsetWidth, offsetHeight];
};
var getUnitValue = function getUnitValue2(size, tabPositionTopOrBottom) {
  return size[tabPositionTopOrBottom ? 0 : 1];
};
var TabNavList = React89.forwardRef(function(props, ref) {
  var className = props.className, style2 = props.style, id = props.id, animated = props.animated, activeKey = props.activeKey, rtl = props.rtl, extra = props.extra, editable = props.editable, locale5 = props.locale, tabPosition = props.tabPosition, tabBarGutter = props.tabBarGutter, children = props.children, onTabClick = props.onTabClick, onTabScroll = props.onTabScroll, indicator = props.indicator;
  var _React$useContext = React89.useContext(TabContext_default), prefixCls = _React$useContext.prefixCls, tabs = _React$useContext.tabs;
  var containerRef = (0, import_react25.useRef)(null);
  var extraLeftRef = (0, import_react25.useRef)(null);
  var extraRightRef = (0, import_react25.useRef)(null);
  var tabsWrapperRef = (0, import_react25.useRef)(null);
  var tabListRef = (0, import_react25.useRef)(null);
  var operationsRef = (0, import_react25.useRef)(null);
  var innerAddButtonRef = (0, import_react25.useRef)(null);
  var tabPositionTopOrBottom = tabPosition === "top" || tabPosition === "bottom";
  var _useSyncState = useSyncState2(0, function(next, prev) {
    if (tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? "left" : "right"
      });
    }
  }), _useSyncState2 = _slicedToArray(_useSyncState, 2), transformLeft = _useSyncState2[0], setTransformLeft = _useSyncState2[1];
  var _useSyncState3 = useSyncState2(0, function(next, prev) {
    if (!tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? "top" : "bottom"
      });
    }
  }), _useSyncState4 = _slicedToArray(_useSyncState3, 2), transformTop = _useSyncState4[0], setTransformTop = _useSyncState4[1];
  var _useState = (0, import_react25.useState)([0, 0]), _useState2 = _slicedToArray(_useState, 2), containerExcludeExtraSize = _useState2[0], setContainerExcludeExtraSize = _useState2[1];
  var _useState3 = (0, import_react25.useState)([0, 0]), _useState4 = _slicedToArray(_useState3, 2), tabContentSize = _useState4[0], setTabContentSize = _useState4[1];
  var _useState5 = (0, import_react25.useState)([0, 0]), _useState6 = _slicedToArray(_useState5, 2), addSize = _useState6[0], setAddSize = _useState6[1];
  var _useState7 = (0, import_react25.useState)([0, 0]), _useState8 = _slicedToArray(_useState7, 2), operationSize = _useState8[0], setOperationSize = _useState8[1];
  var _useUpdateState = useUpdateState(/* @__PURE__ */ new Map()), _useUpdateState2 = _slicedToArray(_useUpdateState, 2), tabSizes = _useUpdateState2[0], setTabSizes = _useUpdateState2[1];
  var tabOffsets = useOffsets(tabs, tabSizes, tabContentSize[0]);
  var containerExcludeExtraSizeValue = getUnitValue(containerExcludeExtraSize, tabPositionTopOrBottom);
  var tabContentSizeValue = getUnitValue(tabContentSize, tabPositionTopOrBottom);
  var addSizeValue = getUnitValue(addSize, tabPositionTopOrBottom);
  var operationSizeValue = getUnitValue(operationSize, tabPositionTopOrBottom);
  var needScroll = Math.floor(containerExcludeExtraSizeValue) < Math.floor(tabContentSizeValue + addSizeValue);
  var visibleTabContentValue = needScroll ? containerExcludeExtraSizeValue - operationSizeValue : containerExcludeExtraSizeValue - addSizeValue;
  var operationsHiddenClassName = "".concat(prefixCls, "-nav-operations-hidden");
  var transformMin = 0;
  var transformMax = 0;
  if (!tabPositionTopOrBottom) {
    transformMin = Math.min(0, visibleTabContentValue - tabContentSizeValue);
    transformMax = 0;
  } else if (rtl) {
    transformMin = 0;
    transformMax = Math.max(0, tabContentSizeValue - visibleTabContentValue);
  } else {
    transformMin = Math.min(0, visibleTabContentValue - tabContentSizeValue);
    transformMax = 0;
  }
  function alignInRange(value) {
    if (value < transformMin) {
      return transformMin;
    }
    if (value > transformMax) {
      return transformMax;
    }
    return value;
  }
  var touchMovingRef = (0, import_react25.useRef)(null);
  var _useState9 = (0, import_react25.useState)(), _useState10 = _slicedToArray(_useState9, 2), lockAnimation = _useState10[0], setLockAnimation = _useState10[1];
  function doLockAnimation() {
    setLockAnimation(Date.now());
  }
  function clearTouchMoving() {
    if (touchMovingRef.current) {
      clearTimeout(touchMovingRef.current);
    }
  }
  useTouchMove(tabsWrapperRef, function(offsetX, offsetY) {
    function doMove(setState, offset) {
      setState(function(value) {
        var newValue = alignInRange(value + offset);
        return newValue;
      });
    }
    if (!needScroll) {
      return false;
    }
    if (tabPositionTopOrBottom) {
      doMove(setTransformLeft, offsetX);
    } else {
      doMove(setTransformTop, offsetY);
    }
    clearTouchMoving();
    doLockAnimation();
    return true;
  });
  (0, import_react25.useEffect)(function() {
    clearTouchMoving();
    if (lockAnimation) {
      touchMovingRef.current = setTimeout(function() {
        setLockAnimation(0);
      }, 100);
    }
    return clearTouchMoving;
  }, [lockAnimation]);
  var _useVisibleRange = useVisibleRange(
    tabOffsets,
    // Container
    visibleTabContentValue,
    // Transform
    tabPositionTopOrBottom ? transformLeft : transformTop,
    // Tabs
    tabContentSizeValue,
    // Add
    addSizeValue,
    // Operation
    operationSizeValue,
    _objectSpread2(_objectSpread2({}, props), {}, {
      tabs
    })
  ), _useVisibleRange2 = _slicedToArray(_useVisibleRange, 2), visibleStart = _useVisibleRange2[0], visibleEnd = _useVisibleRange2[1];
  var scrollToTab = useEvent(function() {
    var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : activeKey;
    var tabOffset = tabOffsets.get(key) || {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0
    };
    if (tabPositionTopOrBottom) {
      var newTransform = transformLeft;
      if (rtl) {
        if (tabOffset.right < transformLeft) {
          newTransform = tabOffset.right;
        } else if (tabOffset.right + tabOffset.width > transformLeft + visibleTabContentValue) {
          newTransform = tabOffset.right + tabOffset.width - visibleTabContentValue;
        }
      } else if (tabOffset.left < -transformLeft) {
        newTransform = -tabOffset.left;
      } else if (tabOffset.left + tabOffset.width > -transformLeft + visibleTabContentValue) {
        newTransform = -(tabOffset.left + tabOffset.width - visibleTabContentValue);
      }
      setTransformTop(0);
      setTransformLeft(alignInRange(newTransform));
    } else {
      var _newTransform = transformTop;
      if (tabOffset.top < -transformTop) {
        _newTransform = -tabOffset.top;
      } else if (tabOffset.top + tabOffset.height > -transformTop + visibleTabContentValue) {
        _newTransform = -(tabOffset.top + tabOffset.height - visibleTabContentValue);
      }
      setTransformLeft(0);
      setTransformTop(alignInRange(_newTransform));
    }
  });
  var _useState11 = (0, import_react25.useState)(), _useState12 = _slicedToArray(_useState11, 2), focusKey = _useState12[0], setFocusKey = _useState12[1];
  var _useState13 = (0, import_react25.useState)(false), _useState14 = _slicedToArray(_useState13, 2), isMouse = _useState14[0], setIsMouse = _useState14[1];
  var enabledTabs = tabs.filter(function(tab) {
    return !tab.disabled;
  }).map(function(tab) {
    return tab.key;
  });
  var onOffset = function onOffset2(offset) {
    var currentIndex = enabledTabs.indexOf(focusKey || activeKey);
    var len = enabledTabs.length;
    var nextIndex = (currentIndex + offset + len) % len;
    var newKey = enabledTabs[nextIndex];
    setFocusKey(newKey);
  };
  var handleKeyDown = function handleKeyDown2(e) {
    var code = e.code;
    var isRTL = rtl && tabPositionTopOrBottom;
    var firstEnabledTab = enabledTabs[0];
    var lastEnabledTab = enabledTabs[enabledTabs.length - 1];
    switch (code) {
      case "ArrowLeft": {
        if (tabPositionTopOrBottom) {
          onOffset(isRTL ? 1 : -1);
        }
        break;
      }
      case "ArrowRight": {
        if (tabPositionTopOrBottom) {
          onOffset(isRTL ? -1 : 1);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!tabPositionTopOrBottom) {
          onOffset(-1);
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (!tabPositionTopOrBottom) {
          onOffset(1);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        setFocusKey(firstEnabledTab);
        break;
      }
      case "End": {
        e.preventDefault();
        setFocusKey(lastEnabledTab);
        break;
      }
      case "Enter":
      case "Space": {
        e.preventDefault();
        onTabClick(focusKey !== null && focusKey !== void 0 ? focusKey : activeKey, e);
        break;
      }
      case "Backspace":
      case "Delete": {
        var removeIndex = enabledTabs.indexOf(focusKey);
        var removeTab = tabs.find(function(tab) {
          return tab.key === focusKey;
        });
        var removable = getRemovable(removeTab === null || removeTab === void 0 ? void 0 : removeTab.closable, removeTab === null || removeTab === void 0 ? void 0 : removeTab.closeIcon, editable, removeTab === null || removeTab === void 0 ? void 0 : removeTab.disabled);
        if (removable) {
          e.preventDefault();
          e.stopPropagation();
          editable.onEdit("remove", {
            key: focusKey,
            event: e
          });
          if (removeIndex === enabledTabs.length - 1) {
            onOffset(-1);
          } else {
            onOffset(1);
          }
        }
        break;
      }
    }
  };
  var tabNodeStyle = {};
  if (tabPositionTopOrBottom) {
    tabNodeStyle[rtl ? "marginRight" : "marginLeft"] = tabBarGutter;
  } else {
    tabNodeStyle.marginTop = tabBarGutter;
  }
  var tabNodes = tabs.map(function(tab, i) {
    var key = tab.key;
    return React89.createElement(TabNode_default, {
      id,
      prefixCls,
      key,
      tab,
      style: i === 0 ? void 0 : tabNodeStyle,
      closable: tab.closable,
      editable,
      active: key === activeKey,
      focus: key === focusKey,
      renderWrapper: children,
      removeAriaLabel: locale5 === null || locale5 === void 0 ? void 0 : locale5.removeAriaLabel,
      tabCount: enabledTabs.length,
      currentPosition: i + 1,
      onClick: function onClick(e) {
        onTabClick(key, e);
      },
      onKeyDown: handleKeyDown,
      onFocus: function onFocus() {
        if (!isMouse) {
          setFocusKey(key);
        }
        scrollToTab(key);
        doLockAnimation();
        if (!tabsWrapperRef.current) {
          return;
        }
        if (!rtl) {
          tabsWrapperRef.current.scrollLeft = 0;
        }
        tabsWrapperRef.current.scrollTop = 0;
      },
      onBlur: function onBlur() {
        setFocusKey(void 0);
      },
      onMouseDown: function onMouseDown() {
        setIsMouse(true);
      },
      onMouseUp: function onMouseUp() {
        setIsMouse(false);
      }
    });
  });
  var updateTabSizes = function updateTabSizes2() {
    return setTabSizes(function() {
      var _tabListRef$current;
      var newSizes = /* @__PURE__ */ new Map();
      var listRect = (_tabListRef$current = tabListRef.current) === null || _tabListRef$current === void 0 ? void 0 : _tabListRef$current.getBoundingClientRect();
      tabs.forEach(function(_ref2) {
        var _tabListRef$current2;
        var key = _ref2.key;
        var btnNode = (_tabListRef$current2 = tabListRef.current) === null || _tabListRef$current2 === void 0 ? void 0 : _tabListRef$current2.querySelector('[data-node-key="'.concat(genDataNodeKey(key), '"]'));
        if (btnNode) {
          var _getTabSize = getTabSize(btnNode, listRect), _getTabSize2 = _slicedToArray(_getTabSize, 4), width = _getTabSize2[0], height = _getTabSize2[1], left = _getTabSize2[2], top = _getTabSize2[3];
          newSizes.set(key, {
            width,
            height,
            left,
            top
          });
        }
      });
      return newSizes;
    });
  };
  (0, import_react25.useEffect)(function() {
    updateTabSizes();
  }, [tabs.map(function(tab) {
    return tab.key;
  }).join("_")]);
  var onListHolderResize = useUpdate(function() {
    var containerSize = getSize(containerRef);
    var extraLeftSize = getSize(extraLeftRef);
    var extraRightSize = getSize(extraRightRef);
    setContainerExcludeExtraSize([containerSize[0] - extraLeftSize[0] - extraRightSize[0], containerSize[1] - extraLeftSize[1] - extraRightSize[1]]);
    var newAddSize = getSize(innerAddButtonRef);
    setAddSize(newAddSize);
    var newOperationSize = getSize(operationsRef);
    setOperationSize(newOperationSize);
    var tabContentFullSize = getSize(tabListRef);
    setTabContentSize([tabContentFullSize[0] - newAddSize[0], tabContentFullSize[1] - newAddSize[1]]);
    updateTabSizes();
  });
  var startHiddenTabs = tabs.slice(0, visibleStart);
  var endHiddenTabs = tabs.slice(visibleEnd + 1);
  var hiddenTabs = [].concat(_toConsumableArray(startHiddenTabs), _toConsumableArray(endHiddenTabs));
  var activeTabOffset = tabOffsets.get(activeKey);
  var _useIndicator = useIndicator_default({
    activeTabOffset,
    horizontal: tabPositionTopOrBottom,
    indicator,
    rtl
  }), indicatorStyle = _useIndicator.style;
  (0, import_react25.useEffect)(function() {
    scrollToTab();
  }, [activeKey, transformMin, transformMax, stringify(activeTabOffset), stringify(tabOffsets), tabPositionTopOrBottom]);
  (0, import_react25.useEffect)(function() {
    onListHolderResize();
  }, [rtl]);
  var hasDropdown = !!hiddenTabs.length;
  var wrapPrefix = "".concat(prefixCls, "-nav-wrap");
  var pingLeft;
  var pingRight;
  var pingTop;
  var pingBottom;
  if (tabPositionTopOrBottom) {
    if (rtl) {
      pingRight = transformLeft > 0;
      pingLeft = transformLeft !== transformMax;
    } else {
      pingLeft = transformLeft < 0;
      pingRight = transformLeft !== transformMin;
    }
  } else {
    pingTop = transformTop < 0;
    pingBottom = transformTop !== transformMin;
  }
  return React89.createElement(es_default2, {
    onResize: onListHolderResize
  }, React89.createElement("div", {
    ref: useComposeRef(ref, containerRef),
    role: "tablist",
    "aria-orientation": tabPositionTopOrBottom ? "horizontal" : "vertical",
    className: (0, import_classnames29.default)("".concat(prefixCls, "-nav"), className),
    style: style2,
    onKeyDown: function onKeyDown() {
      doLockAnimation();
    }
  }, React89.createElement(ExtraContent_default, {
    ref: extraLeftRef,
    position: "left",
    extra,
    prefixCls
  }), React89.createElement(es_default2, {
    onResize: onListHolderResize
  }, React89.createElement("div", {
    className: (0, import_classnames29.default)(wrapPrefix, _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(wrapPrefix, "-ping-left"), pingLeft), "".concat(wrapPrefix, "-ping-right"), pingRight), "".concat(wrapPrefix, "-ping-top"), pingTop), "".concat(wrapPrefix, "-ping-bottom"), pingBottom)),
    ref: tabsWrapperRef
  }, React89.createElement(es_default2, {
    onResize: onListHolderResize
  }, React89.createElement("div", {
    ref: tabListRef,
    className: "".concat(prefixCls, "-nav-list"),
    style: {
      transform: "translate(".concat(transformLeft, "px, ").concat(transformTop, "px)"),
      transition: lockAnimation ? "none" : void 0
    }
  }, tabNodes, React89.createElement(AddButton_default, {
    ref: innerAddButtonRef,
    prefixCls,
    locale: locale5,
    editable,
    style: _objectSpread2(_objectSpread2({}, tabNodes.length === 0 ? void 0 : tabNodeStyle), {}, {
      visibility: hasDropdown ? "hidden" : null
    })
  }), React89.createElement("div", {
    className: (0, import_classnames29.default)("".concat(prefixCls, "-ink-bar"), _defineProperty({}, "".concat(prefixCls, "-ink-bar-animated"), animated.inkBar)),
    style: indicatorStyle
  }))))), React89.createElement(OperationNode_default, _extends({}, props, {
    removeAriaLabel: locale5 === null || locale5 === void 0 ? void 0 : locale5.removeAriaLabel,
    ref: operationsRef,
    prefixCls,
    tabs: hiddenTabs,
    className: !hasDropdown && operationsHiddenClassName,
    tabMoving: !!lockAnimation
  })), React89.createElement(ExtraContent_default, {
    ref: extraRightRef,
    position: "right",
    extra,
    prefixCls
  })));
});
var TabNavList_default = TabNavList;

// node_modules/rc-tabs/es/TabPanelList/TabPane.js
var import_classnames30 = __toESM(require_classnames());
var React90 = __toESM(require_react());
var TabPane = React90.forwardRef(function(props, ref) {
  var prefixCls = props.prefixCls, className = props.className, style2 = props.style, id = props.id, active = props.active, tabKey = props.tabKey, children = props.children;
  return React90.createElement("div", {
    id: id && "".concat(id, "-panel-").concat(tabKey),
    role: "tabpanel",
    tabIndex: active ? 0 : -1,
    "aria-labelledby": id && "".concat(id, "-tab-").concat(tabKey),
    "aria-hidden": !active,
    style: style2,
    className: (0, import_classnames30.default)(prefixCls, active && "".concat(prefixCls, "-active"), className),
    ref
  }, children);
});
if (true) {
  TabPane.displayName = "TabPane";
}
var TabPane_default = TabPane;

// node_modules/rc-tabs/es/TabNavList/Wrapper.js
var _excluded18 = ["renderTabBar"];
var _excluded26 = ["label", "key"];
var TabNavListWrapper = function TabNavListWrapper2(_ref) {
  var renderTabBar = _ref.renderTabBar, restProps = _objectWithoutProperties(_ref, _excluded18);
  var _React$useContext = React91.useContext(TabContext_default), tabs = _React$useContext.tabs;
  if (renderTabBar) {
    var tabNavBarProps = _objectSpread2(_objectSpread2({}, restProps), {}, {
      // Legacy support. We do not use this actually
      panes: tabs.map(function(_ref2) {
        var label = _ref2.label, key = _ref2.key, restTabProps = _objectWithoutProperties(_ref2, _excluded26);
        return React91.createElement(TabPane_default, _extends({
          tab: label,
          key,
          tabKey: key
        }, restTabProps));
      })
    });
    return renderTabBar(tabNavBarProps, TabNavList_default);
  }
  return React91.createElement(TabNavList_default, restProps);
};
if (true) {
  TabNavListWrapper.displayName = "TabNavListWrapper";
}
var Wrapper_default = TabNavListWrapper;

// node_modules/rc-tabs/es/TabPanelList/index.js
var import_classnames31 = __toESM(require_classnames());
var React92 = __toESM(require_react());
var _excluded19 = ["key", "forceRender", "style", "className", "destroyInactiveTabPane"];
var TabPanelList = function TabPanelList2(props) {
  var id = props.id, activeKey = props.activeKey, animated = props.animated, tabPosition = props.tabPosition, destroyInactiveTabPane = props.destroyInactiveTabPane;
  var _React$useContext = React92.useContext(TabContext_default), prefixCls = _React$useContext.prefixCls, tabs = _React$useContext.tabs;
  var tabPaneAnimated = animated.tabPane;
  var tabPanePrefixCls = "".concat(prefixCls, "-tabpane");
  return React92.createElement("div", {
    className: (0, import_classnames31.default)("".concat(prefixCls, "-content-holder"))
  }, React92.createElement("div", {
    className: (0, import_classnames31.default)("".concat(prefixCls, "-content"), "".concat(prefixCls, "-content-").concat(tabPosition), _defineProperty({}, "".concat(prefixCls, "-content-animated"), tabPaneAnimated))
  }, tabs.map(function(item) {
    var key = item.key, forceRender = item.forceRender, paneStyle = item.style, paneClassName = item.className, itemDestroyInactiveTabPane = item.destroyInactiveTabPane, restTabProps = _objectWithoutProperties(item, _excluded19);
    var active = key === activeKey;
    return React92.createElement(es_default, _extends({
      key,
      visible: active,
      forceRender,
      removeOnLeave: !!(destroyInactiveTabPane || itemDestroyInactiveTabPane),
      leavedClassName: "".concat(tabPanePrefixCls, "-hidden")
    }, animated.tabPaneMotion), function(_ref, ref) {
      var motionStyle = _ref.style, motionClassName = _ref.className;
      return React92.createElement(TabPane_default, _extends({}, restTabProps, {
        prefixCls: tabPanePrefixCls,
        id,
        tabKey: key,
        animated: tabPaneAnimated,
        active,
        style: _objectSpread2(_objectSpread2({}, paneStyle), motionStyle),
        className: (0, import_classnames31.default)(paneClassName, motionClassName),
        ref
      }));
    });
  })));
};
var TabPanelList_default = TabPanelList;

// node_modules/rc-tabs/es/hooks/useAnimateConfig.js
function useAnimateConfig() {
  var animated = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
    inkBar: true,
    tabPane: false
  };
  var mergedAnimated;
  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: false
    };
  } else {
    mergedAnimated = _objectSpread2({
      inkBar: true
    }, _typeof(animated) === "object" ? animated : {});
  }
  if (mergedAnimated.tabPaneMotion && mergedAnimated.tabPane === void 0) {
    mergedAnimated.tabPane = true;
  }
  if (!mergedAnimated.tabPaneMotion && mergedAnimated.tabPane) {
    if (true) {
      warning_default(false, "`animated.tabPane` is true but `animated.tabPaneMotion` is not provided. Motion will not work.");
    }
    mergedAnimated.tabPane = false;
  }
  return mergedAnimated;
}

// node_modules/rc-tabs/es/Tabs.js
var _excluded20 = ["id", "prefixCls", "className", "items", "direction", "activeKey", "defaultActiveKey", "editable", "animated", "tabPosition", "tabBarGutter", "tabBarStyle", "tabBarExtraContent", "locale", "more", "destroyInactiveTabPane", "renderTabBar", "onChange", "onTabClick", "onTabScroll", "getPopupContainer", "popupClassName", "indicator"];
var uuid3 = 0;
var Tabs = React93.forwardRef(function(props, ref) {
  var id = props.id, _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-tabs" : _props$prefixCls, className = props.className, items = props.items, direction = props.direction, activeKey = props.activeKey, defaultActiveKey = props.defaultActiveKey, editable = props.editable, animated = props.animated, _props$tabPosition = props.tabPosition, tabPosition = _props$tabPosition === void 0 ? "top" : _props$tabPosition, tabBarGutter = props.tabBarGutter, tabBarStyle = props.tabBarStyle, tabBarExtraContent = props.tabBarExtraContent, locale5 = props.locale, more = props.more, destroyInactiveTabPane = props.destroyInactiveTabPane, renderTabBar = props.renderTabBar, onChange = props.onChange, onTabClick = props.onTabClick, onTabScroll = props.onTabScroll, getPopupContainer = props.getPopupContainer, popupClassName = props.popupClassName, indicator = props.indicator, restProps = _objectWithoutProperties(props, _excluded20);
  var tabs = React93.useMemo(function() {
    return (items || []).filter(function(item) {
      return item && _typeof(item) === "object" && "key" in item;
    });
  }, [items]);
  var rtl = direction === "rtl";
  var mergedAnimated = useAnimateConfig(animated);
  var _useState = (0, import_react26.useState)(false), _useState2 = _slicedToArray(_useState, 2), mobile = _useState2[0], setMobile = _useState2[1];
  (0, import_react26.useEffect)(function() {
    setMobile(isMobile_default());
  }, []);
  var _useMergedState = useMergedState(function() {
    var _tabs$;
    return (_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.key;
  }, {
    value: activeKey,
    defaultValue: defaultActiveKey
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedActiveKey = _useMergedState2[0], setMergedActiveKey = _useMergedState2[1];
  var _useState3 = (0, import_react26.useState)(function() {
    return tabs.findIndex(function(tab) {
      return tab.key === mergedActiveKey;
    });
  }), _useState4 = _slicedToArray(_useState3, 2), activeIndex = _useState4[0], setActiveIndex = _useState4[1];
  (0, import_react26.useEffect)(function() {
    var newActiveIndex = tabs.findIndex(function(tab) {
      return tab.key === mergedActiveKey;
    });
    if (newActiveIndex === -1) {
      var _tabs$newActiveIndex;
      newActiveIndex = Math.max(0, Math.min(activeIndex, tabs.length - 1));
      setMergedActiveKey((_tabs$newActiveIndex = tabs[newActiveIndex]) === null || _tabs$newActiveIndex === void 0 ? void 0 : _tabs$newActiveIndex.key);
    }
    setActiveIndex(newActiveIndex);
  }, [tabs.map(function(tab) {
    return tab.key;
  }).join("_"), mergedActiveKey, activeIndex]);
  var _useMergedState3 = useMergedState(null, {
    value: id
  }), _useMergedState4 = _slicedToArray(_useMergedState3, 2), mergedId = _useMergedState4[0], setMergedId = _useMergedState4[1];
  (0, import_react26.useEffect)(function() {
    if (!id) {
      setMergedId("rc-tabs-".concat(false ? "test" : uuid3));
      uuid3 += 1;
    }
  }, []);
  function onInternalTabClick(key, e) {
    onTabClick === null || onTabClick === void 0 || onTabClick(key, e);
    var isActiveChanged = key !== mergedActiveKey;
    setMergedActiveKey(key);
    if (isActiveChanged) {
      onChange === null || onChange === void 0 || onChange(key);
    }
  }
  var sharedProps = {
    id: mergedId,
    activeKey: mergedActiveKey,
    animated: mergedAnimated,
    tabPosition,
    rtl,
    mobile
  };
  var tabNavBarProps = _objectSpread2(_objectSpread2({}, sharedProps), {}, {
    editable,
    locale: locale5,
    more,
    tabBarGutter,
    onTabClick: onInternalTabClick,
    onTabScroll,
    extra: tabBarExtraContent,
    style: tabBarStyle,
    panes: null,
    getPopupContainer,
    popupClassName,
    indicator
  });
  return React93.createElement(TabContext_default.Provider, {
    value: {
      tabs,
      prefixCls
    }
  }, React93.createElement("div", _extends({
    ref,
    id,
    className: (0, import_classnames32.default)(prefixCls, "".concat(prefixCls, "-").concat(tabPosition), _defineProperty(_defineProperty(_defineProperty({}, "".concat(prefixCls, "-mobile"), mobile), "".concat(prefixCls, "-editable"), editable), "".concat(prefixCls, "-rtl"), rtl), className)
  }, restProps), React93.createElement(Wrapper_default, _extends({}, tabNavBarProps, {
    renderTabBar
  })), React93.createElement(TabPanelList_default, _extends({
    destroyInactiveTabPane
  }, sharedProps, {
    animated: mergedAnimated
  }))));
});
if (true) {
  Tabs.displayName = "Tabs";
}
var Tabs_default = Tabs;

// node_modules/rc-tabs/es/index.js
var es_default8 = Tabs_default;

// node_modules/antd/es/config-provider/hooks/useCSSVarCls.js
var useCSSVarCls = (prefixCls) => {
  const [, , , , cssVar] = useToken();
  return cssVar ? `${prefixCls}-css-var` : "";
};
var useCSSVarCls_default = useCSSVarCls;

// node_modules/antd/es/_util/motion.js
var getCollapsedHeight = () => ({
  height: 0,
  opacity: 0
});
var getRealHeight = (node) => {
  const {
    scrollHeight
  } = node;
  return {
    height: scrollHeight,
    opacity: 1
  };
};
var getCurrentHeight = (node) => ({
  height: node ? node.offsetHeight : 0
});
var skipOpacityTransition = (_, event) => (event === null || event === void 0 ? void 0 : event.deadline) === true || event.propertyName === "height";
var initCollapseMotion = (rootCls = defaultPrefixCls) => ({
  motionName: `${rootCls}-motion-collapse`,
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onAppearEnd: skipOpacityTransition,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500
});
var getTransitionName2 = (rootPrefixCls, motion2, transitionName) => {
  if (transitionName !== void 0) {
    return transitionName;
  }
  return `${rootPrefixCls}-${motion2}`;
};
var motion_default = initCollapseMotion;

// node_modules/antd/es/tabs/hooks/useAnimateConfig.js
var motion = {
  motionAppear: false,
  motionEnter: true,
  motionLeave: true
};
function useAnimateConfig2(prefixCls, animated = {
  inkBar: true,
  tabPane: false
}) {
  let mergedAnimated;
  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true
    };
  } else {
    mergedAnimated = Object.assign({
      inkBar: true
    }, typeof animated === "object" ? animated : {});
  }
  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = Object.assign(Object.assign({}, motion), {
      motionName: getTransitionName2(prefixCls, "switch")
    });
  }
  return mergedAnimated;
}

// node_modules/antd/es/tabs/hooks/useLegacyItems.js
var React94 = __toESM(require_react());
var __rest2 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function filter(items) {
  return items.filter((item) => item);
}
function useLegacyItems(items, children) {
  if (true) {
    const warning5 = devUseWarning("Tabs");
    warning5.deprecated(!children, "Tabs.TabPane", "items");
  }
  if (items) {
    return items.map((item) => {
      var _a;
      const mergedDestroyOnHidden = (_a = item.destroyOnHidden) !== null && _a !== void 0 ? _a : item.destroyInactiveTabPane;
      return Object.assign(Object.assign({}, item), {
        // TODO: In the future, destroyInactiveTabPane in rc-tabs needs to be upgrade to destroyOnHidden
        destroyInactiveTabPane: mergedDestroyOnHidden
      });
    });
  }
  const childrenItems = toArray(children).map((node) => {
    if (React94.isValidElement(node)) {
      const {
        key,
        props
      } = node;
      const _a = props || {}, {
        tab
      } = _a, restProps = __rest2(_a, ["tab"]);
      const item = Object.assign(Object.assign({
        key: String(key)
      }, restProps), {
        label: tab
      });
      return item;
    }
    return null;
  });
  return filter(childrenItems);
}
var useLegacyItems_default = useLegacyItems;

// node_modules/antd/es/style/motion/collapse.js
var genCollapseMotion = (token) => ({
  [token.componentCls]: {
    // For common/openAnimation
    [`${token.antCls}-motion-collapse-legacy`]: {
      overflow: "hidden",
      "&-active": {
        transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
      }
    },
    [`${token.antCls}-motion-collapse`]: {
      overflow: "hidden",
      transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
    }
  }
});
var collapse_default = genCollapseMotion;

// node_modules/antd/es/style/motion/motion.js
var initMotionCommon = (duration) => ({
  animationDuration: duration,
  animationFillMode: "both"
});
var initMotionCommonLeave = (duration) => ({
  animationDuration: duration,
  animationFillMode: "both"
});
var initMotion = (motionCls, inKeyframes, outKeyframes, duration, sameLevel = false) => {
  const sameLevelPrefix = sameLevel ? "&" : "";
  return {
    [`
      ${sameLevelPrefix}${motionCls}-enter,
      ${sameLevelPrefix}${motionCls}-appear
    `]: Object.assign(Object.assign({}, initMotionCommon(duration)), {
      animationPlayState: "paused"
    }),
    [`${sameLevelPrefix}${motionCls}-leave`]: Object.assign(Object.assign({}, initMotionCommonLeave(duration)), {
      animationPlayState: "paused"
    }),
    [`
      ${sameLevelPrefix}${motionCls}-enter${motionCls}-enter-active,
      ${sameLevelPrefix}${motionCls}-appear${motionCls}-appear-active
    `]: {
      animationName: inKeyframes,
      animationPlayState: "running"
    },
    [`${sameLevelPrefix}${motionCls}-leave${motionCls}-leave-active`]: {
      animationName: outKeyframes,
      animationPlayState: "running",
      pointerEvents: "none"
    }
  };
};

// node_modules/antd/es/style/motion/fade.js
var fadeIn = new Keyframes_default("antFadeIn", {
  "0%": {
    opacity: 0
  },
  "100%": {
    opacity: 1
  }
});
var fadeOut = new Keyframes_default("antFadeOut", {
  "0%": {
    opacity: 1
  },
  "100%": {
    opacity: 0
  }
});
var initFadeMotion = (token, sameLevel = false) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-fade`;
  const sameLevelPrefix = sameLevel ? "&" : "";
  return [initMotion(motionCls, fadeIn, fadeOut, token.motionDurationMid, sameLevel), {
    [`
        ${sameLevelPrefix}${motionCls}-enter,
        ${sameLevelPrefix}${motionCls}-appear
      `]: {
      opacity: 0,
      animationTimingFunction: "linear"
    },
    [`${sameLevelPrefix}${motionCls}-leave`]: {
      animationTimingFunction: "linear"
    }
  }];
};

// node_modules/antd/es/style/motion/move.js
var moveDownIn = new Keyframes_default("antMoveDownIn", {
  "0%": {
    transform: "translate3d(0, 100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
var moveDownOut = new Keyframes_default("antMoveDownOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(0, 100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
var moveLeftIn = new Keyframes_default("antMoveLeftIn", {
  "0%": {
    transform: "translate3d(-100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
var moveLeftOut = new Keyframes_default("antMoveLeftOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(-100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
var moveRightIn = new Keyframes_default("antMoveRightIn", {
  "0%": {
    transform: "translate3d(100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
var moveRightOut = new Keyframes_default("antMoveRightOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
var moveUpIn = new Keyframes_default("antMoveUpIn", {
  "0%": {
    transform: "translate3d(0, -100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
var moveUpOut = new Keyframes_default("antMoveUpOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(0, -100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
var moveMotion = {
  "move-up": {
    inKeyframes: moveUpIn,
    outKeyframes: moveUpOut
  },
  "move-down": {
    inKeyframes: moveDownIn,
    outKeyframes: moveDownOut
  },
  "move-left": {
    inKeyframes: moveLeftIn,
    outKeyframes: moveLeftOut
  },
  "move-right": {
    inKeyframes: moveRightIn,
    outKeyframes: moveRightOut
  }
};
var initMoveMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = moveMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, token.motionDurationMid), {
    [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
      opacity: 0,
      animationTimingFunction: token.motionEaseOutCirc
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInOutCirc
    }
  }];
};

// node_modules/antd/es/style/motion/slide.js
var slideUpIn = new Keyframes_default("antSlideUpIn", {
  "0%": {
    transform: "scaleY(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleY(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  }
});
var slideUpOut = new Keyframes_default("antSlideUpOut", {
  "0%": {
    transform: "scaleY(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleY(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  }
});
var slideDownIn = new Keyframes_default("antSlideDownIn", {
  "0%": {
    transform: "scaleY(0.8)",
    transformOrigin: "100% 100%",
    opacity: 0
  },
  "100%": {
    transform: "scaleY(1)",
    transformOrigin: "100% 100%",
    opacity: 1
  }
});
var slideDownOut = new Keyframes_default("antSlideDownOut", {
  "0%": {
    transform: "scaleY(1)",
    transformOrigin: "100% 100%",
    opacity: 1
  },
  "100%": {
    transform: "scaleY(0.8)",
    transformOrigin: "100% 100%",
    opacity: 0
  }
});
var slideLeftIn = new Keyframes_default("antSlideLeftIn", {
  "0%": {
    transform: "scaleX(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleX(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  }
});
var slideLeftOut = new Keyframes_default("antSlideLeftOut", {
  "0%": {
    transform: "scaleX(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleX(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  }
});
var slideRightIn = new Keyframes_default("antSlideRightIn", {
  "0%": {
    transform: "scaleX(0.8)",
    transformOrigin: "100% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleX(1)",
    transformOrigin: "100% 0%",
    opacity: 1
  }
});
var slideRightOut = new Keyframes_default("antSlideRightOut", {
  "0%": {
    transform: "scaleX(1)",
    transformOrigin: "100% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleX(0.8)",
    transformOrigin: "100% 0%",
    opacity: 0
  }
});
var slideMotion = {
  "slide-up": {
    inKeyframes: slideUpIn,
    outKeyframes: slideUpOut
  },
  "slide-down": {
    inKeyframes: slideDownIn,
    outKeyframes: slideDownOut
  },
  "slide-left": {
    inKeyframes: slideLeftIn,
    outKeyframes: slideLeftOut
  },
  "slide-right": {
    inKeyframes: slideRightIn,
    outKeyframes: slideRightOut
  }
};
var initSlideMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = slideMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, token.motionDurationMid), {
    [`
      ${motionCls}-enter,
      ${motionCls}-appear
    `]: {
      transform: "scale(0)",
      transformOrigin: "0% 0%",
      opacity: 0,
      animationTimingFunction: token.motionEaseOutQuint,
      "&-prepare": {
        transform: "scale(1)"
      }
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInQuint
    }
  }];
};

// node_modules/antd/es/style/motion/zoom.js
var zoomIn = new Keyframes_default("antZoomIn", {
  "0%": {
    transform: "scale(0.2)",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    opacity: 1
  }
});
var zoomOut = new Keyframes_default("antZoomOut", {
  "0%": {
    transform: "scale(1)"
  },
  "100%": {
    transform: "scale(0.2)",
    opacity: 0
  }
});
var zoomBigIn = new Keyframes_default("antZoomBigIn", {
  "0%": {
    transform: "scale(0.8)",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    opacity: 1
  }
});
var zoomBigOut = new Keyframes_default("antZoomBigOut", {
  "0%": {
    transform: "scale(1)"
  },
  "100%": {
    transform: "scale(0.8)",
    opacity: 0
  }
});
var zoomUpIn = new Keyframes_default("antZoomUpIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "50% 0%"
  }
});
var zoomUpOut = new Keyframes_default("antZoomUpOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "50% 0%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 0%",
    opacity: 0
  }
});
var zoomLeftIn = new Keyframes_default("antZoomLeftIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "0% 50%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "0% 50%"
  }
});
var zoomLeftOut = new Keyframes_default("antZoomLeftOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "0% 50%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "0% 50%",
    opacity: 0
  }
});
var zoomRightIn = new Keyframes_default("antZoomRightIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "100% 50%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "100% 50%"
  }
});
var zoomRightOut = new Keyframes_default("antZoomRightOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "100% 50%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "100% 50%",
    opacity: 0
  }
});
var zoomDownIn = new Keyframes_default("antZoomDownIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 100%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "50% 100%"
  }
});
var zoomDownOut = new Keyframes_default("antZoomDownOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "50% 100%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 100%",
    opacity: 0
  }
});
var zoomMotion = {
  zoom: {
    inKeyframes: zoomIn,
    outKeyframes: zoomOut
  },
  "zoom-big": {
    inKeyframes: zoomBigIn,
    outKeyframes: zoomBigOut
  },
  "zoom-big-fast": {
    inKeyframes: zoomBigIn,
    outKeyframes: zoomBigOut
  },
  "zoom-left": {
    inKeyframes: zoomLeftIn,
    outKeyframes: zoomLeftOut
  },
  "zoom-right": {
    inKeyframes: zoomRightIn,
    outKeyframes: zoomRightOut
  },
  "zoom-up": {
    inKeyframes: zoomUpIn,
    outKeyframes: zoomUpOut
  },
  "zoom-down": {
    inKeyframes: zoomDownIn,
    outKeyframes: zoomDownOut
  }
};
var initZoomMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = zoomMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, motionName === "zoom-big-fast" ? token.motionDurationFast : token.motionDurationMid), {
    [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
      transform: "scale(0)",
      opacity: 0,
      animationTimingFunction: token.motionEaseOutCirc,
      "&-prepare": {
        transform: "none"
      }
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInOutCirc
    }
  }];
};

// node_modules/antd/es/tabs/style/motion.js
var genMotionStyle = (token) => {
  const {
    componentCls,
    motionDurationSlow
  } = token;
  return [
    {
      [componentCls]: {
        [`${componentCls}-switch`]: {
          "&-appear, &-enter": {
            transition: "none",
            "&-start": {
              opacity: 0
            },
            "&-active": {
              opacity: 1,
              transition: `opacity ${motionDurationSlow}`
            }
          },
          "&-leave": {
            position: "absolute",
            transition: "none",
            inset: 0,
            "&-start": {
              opacity: 1
            },
            "&-active": {
              opacity: 0,
              transition: `opacity ${motionDurationSlow}`
            }
          }
        }
      }
    },
    // Follow code may reuse in other components
    [initSlideMotion(token, "slide-up"), initSlideMotion(token, "slide-down")]
  ];
};
var motion_default2 = genMotionStyle;

// node_modules/antd/es/tabs/style/index.js
var genCardStyle = (token) => {
  const {
    componentCls,
    tabsCardPadding,
    cardBg,
    cardGutter,
    colorBorderSecondary,
    itemSelectedColor
  } = token;
  return {
    [`${componentCls}-card`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-tab`]: {
          margin: 0,
          padding: tabsCardPadding,
          background: cardBg,
          border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`
        },
        [`${componentCls}-tab-active`]: {
          color: itemSelectedColor,
          background: token.colorBgContainer
        },
        [`${componentCls}-tab-focus:has(${componentCls}-tab-btn:focus-visible)`]: genFocusOutline(token, -3),
        [`& ${componentCls}-tab${componentCls}-tab-focus ${componentCls}-tab-btn:focus-visible`]: {
          outline: "none"
        },
        [`${componentCls}-ink-bar`]: {
          visibility: "hidden"
        }
      },
      // ========================== Top & Bottom ==========================
      [`&${componentCls}-top, &${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginLeft: {
              _skip_check_: true,
              value: unit(cardGutter)
            }
          }
        }
      },
      [`&${componentCls}-top`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
          },
          [`${componentCls}-tab-active`]: {
            borderBottomColor: token.colorBgContainer
          }
        }
      },
      [`&${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
          },
          [`${componentCls}-tab-active`]: {
            borderTopColor: token.colorBgContainer
          }
        }
      },
      // ========================== Left & Right ==========================
      [`&${componentCls}-left, &${componentCls}-right`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginTop: unit(cardGutter)
          }
        }
      },
      [`&${componentCls}-left`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `${unit(token.borderRadiusLG)} 0 0 ${unit(token.borderRadiusLG)}`
            }
          },
          [`${componentCls}-tab-active`]: {
            borderRightColor: {
              _skip_check_: true,
              value: token.colorBgContainer
            }
          }
        }
      },
      [`&${componentCls}-right`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0`
            }
          },
          [`${componentCls}-tab-active`]: {
            borderLeftColor: {
              _skip_check_: true,
              value: token.colorBgContainer
            }
          }
        }
      }
    }
  };
};
var genDropdownStyle = (token) => {
  const {
    componentCls,
    itemHoverColor,
    dropdownEdgeChildVerticalPadding
  } = token;
  return {
    [`${componentCls}-dropdown`]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "absolute",
      top: -9999,
      left: {
        _skip_check_: true,
        value: -9999
      },
      zIndex: token.zIndexPopup,
      display: "block",
      "&-hidden": {
        display: "none"
      },
      [`${componentCls}-dropdown-menu`]: {
        maxHeight: token.tabsDropdownHeight,
        margin: 0,
        padding: `${unit(dropdownEdgeChildVerticalPadding)} 0`,
        overflowX: "hidden",
        overflowY: "auto",
        textAlign: {
          _skip_check_: true,
          value: "left"
        },
        listStyleType: "none",
        backgroundColor: token.colorBgContainer,
        backgroundClip: "padding-box",
        borderRadius: token.borderRadiusLG,
        outline: "none",
        boxShadow: token.boxShadowSecondary,
        "&-item": Object.assign(Object.assign({}, textEllipsis), {
          display: "flex",
          alignItems: "center",
          minWidth: token.tabsDropdownWidth,
          margin: 0,
          padding: `${unit(token.paddingXXS)} ${unit(token.paddingSM)}`,
          color: token.colorText,
          fontWeight: "normal",
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          cursor: "pointer",
          transition: `all ${token.motionDurationSlow}`,
          "> span": {
            flex: 1,
            whiteSpace: "nowrap"
          },
          "&-remove": {
            flex: "none",
            marginLeft: {
              _skip_check_: true,
              value: token.marginSM
            },
            color: token.colorIcon,
            fontSize: token.fontSizeSM,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            "&:hover": {
              color: itemHoverColor
            }
          },
          "&:hover": {
            background: token.controlItemBgHover
          },
          "&-disabled": {
            "&, &:hover": {
              color: token.colorTextDisabled,
              background: "transparent",
              cursor: "not-allowed"
            }
          }
        })
      }
    })
  };
};
var genPositionStyle = (token) => {
  const {
    componentCls,
    margin,
    colorBorderSecondary,
    horizontalMargin,
    verticalItemPadding,
    verticalItemMargin,
    calc
  } = token;
  return {
    // ========================== Top & Bottom ==========================
    [`${componentCls}-top, ${componentCls}-bottom`]: {
      flexDirection: "column",
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        margin: horizontalMargin,
        "&::before": {
          position: "absolute",
          right: {
            _skip_check_: true,
            value: 0
          },
          left: {
            _skip_check_: true,
            value: 0
          },
          borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          content: "''"
        },
        [`${componentCls}-ink-bar`]: {
          height: token.lineWidthBold,
          "&-animated": {
            transition: `width ${token.motionDurationSlow}, left ${token.motionDurationSlow},
            right ${token.motionDurationSlow}`
          }
        },
        [`${componentCls}-nav-wrap`]: {
          "&::before, &::after": {
            top: 0,
            bottom: 0,
            width: token.controlHeight
          },
          "&::before": {
            left: {
              _skip_check_: true,
              value: 0
            },
            boxShadow: token.boxShadowTabsOverflowLeft
          },
          "&::after": {
            right: {
              _skip_check_: true,
              value: 0
            },
            boxShadow: token.boxShadowTabsOverflowRight
          },
          [`&${componentCls}-nav-wrap-ping-left::before`]: {
            opacity: 1
          },
          [`&${componentCls}-nav-wrap-ping-right::after`]: {
            opacity: 1
          }
        }
      }
    },
    [`${componentCls}-top`]: {
      [`> ${componentCls}-nav,
        > div > ${componentCls}-nav`]: {
        "&::before": {
          bottom: 0
        },
        [`${componentCls}-ink-bar`]: {
          bottom: 0
        }
      }
    },
    [`${componentCls}-bottom`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        order: 1,
        marginTop: margin,
        marginBottom: 0,
        "&::before": {
          top: 0
        },
        [`${componentCls}-ink-bar`]: {
          top: 0
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        order: 0
      }
    },
    // ========================== Left & Right ==========================
    [`${componentCls}-left, ${componentCls}-right`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        flexDirection: "column",
        minWidth: calc(token.controlHeight).mul(1.25).equal(),
        // >>>>>>>>>>> Tab
        [`${componentCls}-tab`]: {
          padding: verticalItemPadding,
          textAlign: "center"
        },
        [`${componentCls}-tab + ${componentCls}-tab`]: {
          margin: verticalItemMargin
        },
        // >>>>>>>>>>> Nav
        [`${componentCls}-nav-wrap`]: {
          flexDirection: "column",
          "&::before, &::after": {
            right: {
              _skip_check_: true,
              value: 0
            },
            left: {
              _skip_check_: true,
              value: 0
            },
            height: token.controlHeight
          },
          "&::before": {
            top: 0,
            boxShadow: token.boxShadowTabsOverflowTop
          },
          "&::after": {
            bottom: 0,
            boxShadow: token.boxShadowTabsOverflowBottom
          },
          [`&${componentCls}-nav-wrap-ping-top::before`]: {
            opacity: 1
          },
          [`&${componentCls}-nav-wrap-ping-bottom::after`]: {
            opacity: 1
          }
        },
        // >>>>>>>>>>> Ink Bar
        [`${componentCls}-ink-bar`]: {
          width: token.lineWidthBold,
          "&-animated": {
            transition: `height ${token.motionDurationSlow}, top ${token.motionDurationSlow}`
          }
        },
        [`${componentCls}-nav-list, ${componentCls}-nav-operations`]: {
          flex: "1 0 auto",
          // fix safari scroll problem
          flexDirection: "column"
        }
      }
    },
    [`${componentCls}-left`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-ink-bar`]: {
          right: {
            _skip_check_: true,
            value: 0
          }
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        marginLeft: {
          _skip_check_: true,
          value: unit(calc(token.lineWidth).mul(-1).equal())
        },
        borderLeft: {
          _skip_check_: true,
          value: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        },
        [`> ${componentCls}-content > ${componentCls}-tabpane`]: {
          paddingLeft: {
            _skip_check_: true,
            value: token.paddingLG
          }
        }
      }
    },
    [`${componentCls}-right`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        order: 1,
        [`${componentCls}-ink-bar`]: {
          left: {
            _skip_check_: true,
            value: 0
          }
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        order: 0,
        marginRight: {
          _skip_check_: true,
          value: calc(token.lineWidth).mul(-1).equal()
        },
        borderRight: {
          _skip_check_: true,
          value: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        },
        [`> ${componentCls}-content > ${componentCls}-tabpane`]: {
          paddingRight: {
            _skip_check_: true,
            value: token.paddingLG
          }
        }
      }
    }
  };
};
var genSizeStyle = (token) => {
  const {
    componentCls,
    cardPaddingSM,
    cardPaddingLG,
    cardHeightSM,
    cardHeightLG,
    horizontalItemPaddingSM,
    horizontalItemPaddingLG
  } = token;
  return {
    // >>>>> shared
    [componentCls]: {
      "&-small": {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: horizontalItemPaddingSM,
            fontSize: token.titleFontSizeSM
          }
        }
      },
      "&-large": {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: horizontalItemPaddingLG,
            fontSize: token.titleFontSizeLG,
            lineHeight: token.lineHeightLG
          }
        }
      }
    },
    // >>>>> card
    [`${componentCls}-card`]: {
      // Small
      [`&${componentCls}-small`]: {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: cardPaddingSM
          },
          [`${componentCls}-nav-add`]: {
            minWidth: cardHeightSM,
            minHeight: cardHeightSM
          }
        },
        [`&${componentCls}-bottom`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: `0 0 ${unit(token.borderRadius)} ${unit(token.borderRadius)}`
          }
        },
        [`&${componentCls}-top`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: `${unit(token.borderRadius)} ${unit(token.borderRadius)} 0 0`
          }
        },
        [`&${componentCls}-right`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `0 ${unit(token.borderRadius)} ${unit(token.borderRadius)} 0`
            }
          }
        },
        [`&${componentCls}-left`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `${unit(token.borderRadius)} 0 0 ${unit(token.borderRadius)}`
            }
          }
        }
      },
      // Large
      [`&${componentCls}-large`]: {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: cardPaddingLG
          },
          [`${componentCls}-nav-add`]: {
            minWidth: cardHeightLG,
            minHeight: cardHeightLG
          }
        }
      }
    }
  };
};
var genTabStyle = (token) => {
  const {
    componentCls,
    itemActiveColor,
    itemHoverColor,
    iconCls,
    tabsHorizontalItemMargin,
    horizontalItemPadding,
    itemSelectedColor,
    itemColor
  } = token;
  const tabCls = `${componentCls}-tab`;
  return {
    [tabCls]: {
      position: "relative",
      WebkitTouchCallout: "none",
      WebkitTapHighlightColor: "transparent",
      display: "inline-flex",
      alignItems: "center",
      padding: horizontalItemPadding,
      fontSize: token.titleFontSize,
      background: "transparent",
      border: 0,
      outline: "none",
      cursor: "pointer",
      color: itemColor,
      "&-btn, &-remove": {
        "&:focus:not(:focus-visible), &:active": {
          color: itemActiveColor
        }
      },
      "&-btn": {
        outline: "none",
        transition: `all ${token.motionDurationSlow}`,
        [`${tabCls}-icon:not(:last-child)`]: {
          marginInlineEnd: token.marginSM
        }
      },
      "&-remove": Object.assign({
        flex: "none",
        marginRight: {
          _skip_check_: true,
          value: token.calc(token.marginXXS).mul(-1).equal()
        },
        marginLeft: {
          _skip_check_: true,
          value: token.marginXS
        },
        color: token.colorIcon,
        fontSize: token.fontSizeSM,
        background: "transparent",
        border: "none",
        outline: "none",
        cursor: "pointer",
        transition: `all ${token.motionDurationSlow}`,
        "&:hover": {
          color: token.colorTextHeading
        }
      }, genFocusStyle(token)),
      "&:hover": {
        color: itemHoverColor
      },
      [`&${tabCls}-active ${tabCls}-btn`]: {
        color: itemSelectedColor,
        textShadow: token.tabsActiveTextShadow
      },
      [`&${tabCls}-focus ${tabCls}-btn:focus-visible`]: genFocusOutline(token),
      [`&${tabCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed"
      },
      [`&${tabCls}-disabled ${tabCls}-btn, &${tabCls}-disabled ${componentCls}-remove`]: {
        "&:focus, &:active": {
          color: token.colorTextDisabled
        }
      },
      [`& ${tabCls}-remove ${iconCls}`]: {
        margin: 0
      },
      [`${iconCls}:not(:last-child)`]: {
        marginRight: {
          _skip_check_: true,
          value: token.marginSM
        }
      }
    },
    [`${tabCls} + ${tabCls}`]: {
      margin: {
        _skip_check_: true,
        value: tabsHorizontalItemMargin
      }
    }
  };
};
var genRtlStyle = (token) => {
  const {
    componentCls,
    tabsHorizontalItemMarginRTL,
    iconCls,
    cardGutter,
    calc
  } = token;
  const rtlCls = `${componentCls}-rtl`;
  return {
    [rtlCls]: {
      direction: "rtl",
      [`${componentCls}-nav`]: {
        [`${componentCls}-tab`]: {
          margin: {
            _skip_check_: true,
            value: tabsHorizontalItemMarginRTL
          },
          [`${componentCls}-tab:last-of-type`]: {
            marginLeft: {
              _skip_check_: true,
              value: 0
            }
          },
          [iconCls]: {
            marginRight: {
              _skip_check_: true,
              value: 0
            },
            marginLeft: {
              _skip_check_: true,
              value: unit(token.marginSM)
            }
          },
          [`${componentCls}-tab-remove`]: {
            marginRight: {
              _skip_check_: true,
              value: unit(token.marginXS)
            },
            marginLeft: {
              _skip_check_: true,
              value: unit(calc(token.marginXXS).mul(-1).equal())
            },
            [iconCls]: {
              margin: 0
            }
          }
        }
      },
      [`&${componentCls}-left`]: {
        [`> ${componentCls}-nav`]: {
          order: 1
        },
        [`> ${componentCls}-content-holder`]: {
          order: 0
        }
      },
      [`&${componentCls}-right`]: {
        [`> ${componentCls}-nav`]: {
          order: 0
        },
        [`> ${componentCls}-content-holder`]: {
          order: 1
        }
      },
      // ====================== Card ======================
      [`&${componentCls}-card${componentCls}-top, &${componentCls}-card${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginRight: {
              _skip_check_: true,
              value: cardGutter
            },
            marginLeft: {
              _skip_check_: true,
              value: 0
            }
          }
        }
      }
    },
    [`${componentCls}-dropdown-rtl`]: {
      direction: "rtl"
    },
    [`${componentCls}-menu-item`]: {
      [`${componentCls}-dropdown-rtl`]: {
        textAlign: {
          _skip_check_: true,
          value: "right"
        }
      }
    }
  };
};
var genTabsStyle = (token) => {
  const {
    componentCls,
    tabsCardPadding,
    cardHeight,
    cardGutter,
    itemHoverColor,
    itemActiveColor,
    colorBorderSecondary
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
      display: "flex",
      // ========================== Navigation ==========================
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        position: "relative",
        display: "flex",
        flex: "none",
        alignItems: "center",
        [`${componentCls}-nav-wrap`]: {
          position: "relative",
          display: "flex",
          flex: "auto",
          alignSelf: "stretch",
          overflow: "hidden",
          whiteSpace: "nowrap",
          transform: "translate(0)",
          // Fix chrome render bug
          // >>>>> Ping shadow
          "&::before, &::after": {
            position: "absolute",
            zIndex: 1,
            opacity: 0,
            transition: `opacity ${token.motionDurationSlow}`,
            content: "''",
            pointerEvents: "none"
          }
        },
        [`${componentCls}-nav-list`]: {
          position: "relative",
          display: "flex",
          transition: `opacity ${token.motionDurationSlow}`
        },
        // >>>>>>>> Operations
        [`${componentCls}-nav-operations`]: {
          display: "flex",
          alignSelf: "stretch"
        },
        [`${componentCls}-nav-operations-hidden`]: {
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none"
        },
        [`${componentCls}-nav-more`]: {
          position: "relative",
          padding: tabsCardPadding,
          background: "transparent",
          border: 0,
          color: token.colorText,
          "&::after": {
            position: "absolute",
            right: {
              _skip_check_: true,
              value: 0
            },
            bottom: 0,
            left: {
              _skip_check_: true,
              value: 0
            },
            height: token.calc(token.controlHeightLG).div(8).equal(),
            transform: "translateY(100%)",
            content: "''"
          }
        },
        [`${componentCls}-nav-add`]: Object.assign({
          minWidth: cardHeight,
          minHeight: cardHeight,
          marginLeft: {
            _skip_check_: true,
            value: cardGutter
          },
          background: "transparent",
          border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`,
          outline: "none",
          cursor: "pointer",
          color: token.colorText,
          transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`,
          "&:hover": {
            color: itemHoverColor
          },
          "&:active, &:focus:not(:focus-visible)": {
            color: itemActiveColor
          }
        }, genFocusStyle(token, -3))
      },
      [`${componentCls}-extra-content`]: {
        flex: "none"
      },
      // ============================ InkBar ============================
      [`${componentCls}-ink-bar`]: {
        position: "absolute",
        background: token.inkBarColor,
        pointerEvents: "none"
      }
    }), genTabStyle(token)), {
      // =========================== TabPanes ===========================
      [`${componentCls}-content`]: {
        position: "relative",
        width: "100%"
      },
      [`${componentCls}-content-holder`]: {
        flex: "auto",
        minWidth: 0,
        minHeight: 0
      },
      [`${componentCls}-tabpane`]: Object.assign(Object.assign({}, genFocusStyle(token)), {
        "&-hidden": {
          display: "none"
        }
      })
    }),
    [`${componentCls}-centered`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-nav-wrap`]: {
          [`&:not([class*='${componentCls}-nav-wrap-ping']) > ${componentCls}-nav-list`]: {
            margin: "auto"
          }
        }
      }
    }
  };
};
var prepareComponentToken2 = (token) => {
  const {
    cardHeight,
    cardHeightSM,
    cardHeightLG,
    controlHeight,
    controlHeightLG
  } = token;
  const mergedCardHeight = cardHeight || controlHeightLG;
  const mergedCardHeightSM = cardHeightSM || controlHeight;
  const mergedCardHeightLG = cardHeightLG || controlHeightLG + 8;
  return {
    zIndexPopup: token.zIndexPopupBase + 50,
    cardBg: token.colorFillAlter,
    // We can not pass this as valid value,
    // Since `cardHeight` will lock nav add button height.
    cardHeight: mergedCardHeight,
    cardHeightSM: mergedCardHeightSM,
    cardHeightLG: mergedCardHeightLG,
    // Initialize with empty string, because cardPadding will be calculated with cardHeight by default.
    cardPadding: `${(mergedCardHeight - token.fontHeight) / 2 - token.lineWidth}px ${token.padding}px`,
    cardPaddingSM: `${(mergedCardHeightSM - token.fontHeight) / 2 - token.lineWidth}px ${token.paddingXS}px`,
    cardPaddingLG: `${(mergedCardHeightLG - token.fontHeightLG) / 2 - token.lineWidth}px ${token.padding}px`,
    titleFontSize: token.fontSize,
    titleFontSizeLG: token.fontSizeLG,
    titleFontSizeSM: token.fontSize,
    inkBarColor: token.colorPrimary,
    horizontalMargin: `0 0 ${token.margin}px 0`,
    horizontalItemGutter: 32,
    // Fixed Value
    // Initialize with empty string, because horizontalItemMargin will be calculated with horizontalItemGutter by default.
    horizontalItemMargin: ``,
    horizontalItemMarginRTL: ``,
    horizontalItemPadding: `${token.paddingSM}px 0`,
    horizontalItemPaddingSM: `${token.paddingXS}px 0`,
    horizontalItemPaddingLG: `${token.padding}px 0`,
    verticalItemPadding: `${token.paddingXS}px ${token.paddingLG}px`,
    verticalItemMargin: `${token.margin}px 0 0 0`,
    itemColor: token.colorText,
    itemSelectedColor: token.colorPrimary,
    itemHoverColor: token.colorPrimaryHover,
    itemActiveColor: token.colorPrimaryActive,
    cardGutter: token.marginXXS / 2
  };
};
var style_default2 = genStyleHooks("Tabs", (token) => {
  const tabsToken = merge2(token, {
    // `cardPadding` is empty by default, so we could calculate with dynamic `cardHeight`
    tabsCardPadding: token.cardPadding,
    dropdownEdgeChildVerticalPadding: token.paddingXXS,
    tabsActiveTextShadow: "0 0 0.25px currentcolor",
    tabsDropdownHeight: 200,
    tabsDropdownWidth: 120,
    tabsHorizontalItemMargin: `0 0 0 ${unit(token.horizontalItemGutter)}`,
    tabsHorizontalItemMarginRTL: `0 0 0 ${unit(token.horizontalItemGutter)}`
  });
  return [genSizeStyle(tabsToken), genRtlStyle(tabsToken), genPositionStyle(tabsToken), genDropdownStyle(tabsToken), genCardStyle(tabsToken), genTabsStyle(tabsToken), motion_default2(tabsToken)];
}, prepareComponentToken2);

// node_modules/antd/es/tabs/TabPane.js
var TabPane2 = () => null;
if (true) {
  TabPane2.displayName = "DeprecatedTabPane";
}
var TabPane_default2 = TabPane2;

// node_modules/antd/es/tabs/index.js
var __rest3 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var Tabs2 = (props) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
  const {
    type: type5,
    className,
    rootClassName,
    size: customSize,
    onEdit,
    hideAdd,
    centered,
    addIcon,
    removeIcon,
    moreIcon,
    more,
    popupClassName,
    children,
    items,
    animated,
    style: style2,
    indicatorSize,
    indicator,
    destroyInactiveTabPane,
    destroyOnHidden
  } = props, otherProps = __rest3(props, ["type", "className", "rootClassName", "size", "onEdit", "hideAdd", "centered", "addIcon", "removeIcon", "moreIcon", "more", "popupClassName", "children", "items", "animated", "style", "indicatorSize", "indicator", "destroyInactiveTabPane", "destroyOnHidden"]);
  const {
    prefixCls: customizePrefixCls
  } = otherProps;
  const {
    direction,
    tabs,
    getPrefixCls,
    getPopupContainer
  } = React95.useContext(ConfigContext);
  const prefixCls = getPrefixCls("tabs", customizePrefixCls);
  const rootCls = useCSSVarCls_default(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default2(prefixCls, rootCls);
  let editable;
  if (type5 === "editable-card") {
    editable = {
      onEdit: (editType, {
        key,
        event
      }) => {
        onEdit === null || onEdit === void 0 ? void 0 : onEdit(editType === "add" ? event : key, editType);
      },
      removeIcon: (_a = removeIcon !== null && removeIcon !== void 0 ? removeIcon : tabs === null || tabs === void 0 ? void 0 : tabs.removeIcon) !== null && _a !== void 0 ? _a : React95.createElement(CloseOutlined_default2, null),
      addIcon: (addIcon !== null && addIcon !== void 0 ? addIcon : tabs === null || tabs === void 0 ? void 0 : tabs.addIcon) || React95.createElement(PlusOutlined_default2, null),
      showAdd: hideAdd !== true
    };
  }
  const rootPrefixCls = getPrefixCls();
  if (true) {
    const warning5 = devUseWarning("Tabs");
    true ? warning5(!("onPrevClick" in props) && !("onNextClick" in props), "breaking", "`onPrevClick` and `onNextClick` has been removed. Please use `onTabScroll` instead.") : void 0;
    true ? warning5(!(indicatorSize || (tabs === null || tabs === void 0 ? void 0 : tabs.indicatorSize)), "deprecated", "`indicatorSize` has been deprecated. Please use `indicator={{ size: ... }}` instead.") : void 0;
    warning5.deprecated(!("destroyInactiveTabPane" in props || (items === null || items === void 0 ? void 0 : items.some((item) => "destroyInactiveTabPane" in item))), "destroyInactiveTabPane", "destroyOnHidden");
  }
  const size = useSize_default(customSize);
  const mergedItems = useLegacyItems_default(items, children);
  const mergedAnimated = useAnimateConfig2(prefixCls, animated);
  const mergedStyle = Object.assign(Object.assign({}, tabs === null || tabs === void 0 ? void 0 : tabs.style), style2);
  const mergedIndicator = {
    align: (_b = indicator === null || indicator === void 0 ? void 0 : indicator.align) !== null && _b !== void 0 ? _b : (_c = tabs === null || tabs === void 0 ? void 0 : tabs.indicator) === null || _c === void 0 ? void 0 : _c.align,
    size: (_g = (_e = (_d = indicator === null || indicator === void 0 ? void 0 : indicator.size) !== null && _d !== void 0 ? _d : indicatorSize) !== null && _e !== void 0 ? _e : (_f = tabs === null || tabs === void 0 ? void 0 : tabs.indicator) === null || _f === void 0 ? void 0 : _f.size) !== null && _g !== void 0 ? _g : tabs === null || tabs === void 0 ? void 0 : tabs.indicatorSize
  };
  return wrapCSSVar(React95.createElement(es_default8, Object.assign({
    direction,
    getPopupContainer
  }, otherProps, {
    items: mergedItems,
    className: (0, import_classnames33.default)({
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-card`]: ["card", "editable-card"].includes(type5),
      [`${prefixCls}-editable-card`]: type5 === "editable-card",
      [`${prefixCls}-centered`]: centered
    }, tabs === null || tabs === void 0 ? void 0 : tabs.className, className, rootClassName, hashId, cssVarCls, rootCls),
    popupClassName: (0, import_classnames33.default)(popupClassName, hashId, cssVarCls, rootCls),
    style: mergedStyle,
    editable,
    more: Object.assign({
      icon: (_l = (_k = (_j = (_h = tabs === null || tabs === void 0 ? void 0 : tabs.more) === null || _h === void 0 ? void 0 : _h.icon) !== null && _j !== void 0 ? _j : tabs === null || tabs === void 0 ? void 0 : tabs.moreIcon) !== null && _k !== void 0 ? _k : moreIcon) !== null && _l !== void 0 ? _l : React95.createElement(EllipsisOutlined_default2, null),
      transitionName: `${rootPrefixCls}-slide-up`
    }, more),
    prefixCls,
    animated: mergedAnimated,
    indicator: mergedIndicator,
    // TODO: In the future, destroyInactiveTabPane in rc-tabs needs to be upgrade to destroyOnHidden
    destroyInactiveTabPane: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : destroyInactiveTabPane
  })));
};
Tabs2.TabPane = TabPane_default2;
if (true) {
  Tabs2.displayName = "Tabs";
}
var tabs_default = Tabs2;

// node_modules/antd/es/card/Grid.js
var React96 = __toESM(require_react());
var import_classnames34 = __toESM(require_classnames());
var __rest4 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var Grid = (_a) => {
  var {
    prefixCls,
    className,
    hoverable = true
  } = _a, props = __rest4(_a, ["prefixCls", "className", "hoverable"]);
  const {
    getPrefixCls
  } = React96.useContext(ConfigContext);
  const prefix = getPrefixCls("card", prefixCls);
  const classString = (0, import_classnames34.default)(`${prefix}-grid`, className, {
    [`${prefix}-grid-hoverable`]: hoverable
  });
  return React96.createElement("div", Object.assign({}, props, {
    className: classString
  }));
};
var Grid_default = Grid;

// node_modules/antd/es/card/style/index.js
var genCardHeadStyle = (token) => {
  const {
    antCls,
    componentCls,
    headerHeight,
    headerPadding,
    tabsMarginBottom
  } = token;
  return Object.assign(Object.assign({
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    minHeight: headerHeight,
    marginBottom: -1,
    padding: `0 ${unit(headerPadding)}`,
    color: token.colorTextHeading,
    fontWeight: token.fontWeightStrong,
    fontSize: token.headerFontSize,
    background: token.headerBg,
    borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
  }, clearFix()), {
    "&-wrapper": {
      width: "100%",
      display: "flex",
      alignItems: "center"
    },
    "&-title": Object.assign(Object.assign({
      display: "inline-block",
      flex: 1
    }, textEllipsis), {
      [`
          > ${componentCls}-typography,
          > ${componentCls}-typography-edit-content
        `]: {
        insetInlineStart: 0,
        marginTop: 0,
        marginBottom: 0
      }
    }),
    [`${antCls}-tabs-top`]: {
      clear: "both",
      marginBottom: tabsMarginBottom,
      color: token.colorText,
      fontWeight: "normal",
      fontSize: token.fontSize,
      "&-bar": {
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`
      }
    }
  });
};
var genCardGridStyle = (token) => {
  const {
    cardPaddingBase,
    colorBorderSecondary,
    cardShadow,
    lineWidth
  } = token;
  return {
    width: "33.33%",
    padding: cardPaddingBase,
    border: 0,
    borderRadius: 0,
    boxShadow: `
      ${unit(lineWidth)} 0 0 0 ${colorBorderSecondary},
      0 ${unit(lineWidth)} 0 0 ${colorBorderSecondary},
      ${unit(lineWidth)} ${unit(lineWidth)} 0 0 ${colorBorderSecondary},
      ${unit(lineWidth)} 0 0 0 ${colorBorderSecondary} inset,
      0 ${unit(lineWidth)} 0 0 ${colorBorderSecondary} inset;
    `,
    transition: `all ${token.motionDurationMid}`,
    "&-hoverable:hover": {
      position: "relative",
      zIndex: 1,
      boxShadow: cardShadow
    }
  };
};
var genCardActionsStyle = (token) => {
  const {
    componentCls,
    iconCls,
    actionsLiMargin,
    cardActionsIconSize,
    colorBorderSecondary,
    actionsBg
  } = token;
  return Object.assign(Object.assign({
    margin: 0,
    padding: 0,
    listStyle: "none",
    background: actionsBg,
    borderTop: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
    display: "flex",
    borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
  }, clearFix()), {
    "& > li": {
      margin: actionsLiMargin,
      color: token.colorTextDescription,
      textAlign: "center",
      "> span": {
        position: "relative",
        display: "block",
        minWidth: token.calc(token.cardActionsIconSize).mul(2).equal(),
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        cursor: "pointer",
        "&:hover": {
          color: token.colorPrimary,
          transition: `color ${token.motionDurationMid}`
        },
        [`a:not(${componentCls}-btn), > ${iconCls}`]: {
          display: "inline-block",
          width: "100%",
          color: token.colorIcon,
          lineHeight: unit(token.fontHeight),
          transition: `color ${token.motionDurationMid}`,
          "&:hover": {
            color: token.colorPrimary
          }
        },
        [`> ${iconCls}`]: {
          fontSize: cardActionsIconSize,
          lineHeight: unit(token.calc(cardActionsIconSize).mul(token.lineHeight).equal())
        }
      },
      "&:not(:last-child)": {
        borderInlineEnd: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`
      }
    }
  });
};
var genCardMetaStyle = (token) => Object.assign(Object.assign({
  margin: `${unit(token.calc(token.marginXXS).mul(-1).equal())} 0`,
  display: "flex"
}, clearFix()), {
  "&-avatar": {
    paddingInlineEnd: token.padding
  },
  "&-detail": {
    overflow: "hidden",
    flex: 1,
    "> div:not(:last-child)": {
      marginBottom: token.marginXS
    }
  },
  "&-title": Object.assign({
    color: token.colorTextHeading,
    fontWeight: token.fontWeightStrong,
    fontSize: token.fontSizeLG
  }, textEllipsis),
  "&-description": {
    color: token.colorTextDescription
  }
});
var genCardTypeInnerStyle = (token) => {
  const {
    componentCls,
    colorFillAlter,
    headerPadding,
    bodyPadding
  } = token;
  return {
    [`${componentCls}-head`]: {
      padding: `0 ${unit(headerPadding)}`,
      background: colorFillAlter,
      "&-title": {
        fontSize: token.fontSize
      }
    },
    [`${componentCls}-body`]: {
      padding: `${unit(token.padding)} ${unit(bodyPadding)}`
    }
  };
};
var genCardLoadingStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    overflow: "hidden",
    [`${componentCls}-body`]: {
      userSelect: "none"
    }
  };
};
var genCardStyle2 = (token) => {
  const {
    componentCls,
    cardShadow,
    cardHeadPadding,
    colorBorderSecondary,
    boxShadowTertiary,
    bodyPadding,
    extraColor
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "relative",
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      [`&:not(${componentCls}-bordered)`]: {
        boxShadow: boxShadowTertiary
      },
      [`${componentCls}-head`]: genCardHeadStyle(token),
      [`${componentCls}-extra`]: {
        // https://stackoverflow.com/a/22429853/3040605
        marginInlineStart: "auto",
        color: extraColor,
        fontWeight: "normal",
        fontSize: token.fontSize
      },
      [`${componentCls}-body`]: Object.assign({
        padding: bodyPadding,
        borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
      }, clearFix()),
      [`${componentCls}-grid`]: genCardGridStyle(token),
      [`${componentCls}-cover`]: {
        "> *": {
          display: "block",
          width: "100%",
          borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
        }
      },
      [`${componentCls}-actions`]: genCardActionsStyle(token),
      [`${componentCls}-meta`]: genCardMetaStyle(token)
    }),
    [`${componentCls}-bordered`]: {
      border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
      [`${componentCls}-cover`]: {
        marginTop: -1,
        marginInlineStart: -1,
        marginInlineEnd: -1
      }
    },
    [`${componentCls}-hoverable`]: {
      cursor: "pointer",
      transition: `box-shadow ${token.motionDurationMid}, border-color ${token.motionDurationMid}`,
      "&:hover": {
        borderColor: "transparent",
        boxShadow: cardShadow
      }
    },
    [`${componentCls}-contain-grid`]: {
      borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0 `,
      [`${componentCls}-body`]: {
        display: "flex",
        flexWrap: "wrap"
      },
      [`&:not(${componentCls}-loading) ${componentCls}-body`]: {
        marginBlockStart: token.calc(token.lineWidth).mul(-1).equal(),
        marginInlineStart: token.calc(token.lineWidth).mul(-1).equal(),
        padding: 0
      }
    },
    [`${componentCls}-contain-tabs`]: {
      [`> div${componentCls}-head`]: {
        minHeight: 0,
        [`${componentCls}-head-title, ${componentCls}-extra`]: {
          paddingTop: cardHeadPadding
        }
      }
    },
    [`${componentCls}-type-inner`]: genCardTypeInnerStyle(token),
    [`${componentCls}-loading`]: genCardLoadingStyle(token),
    [`${componentCls}-rtl`]: {
      direction: "rtl"
    }
  };
};
var genCardSizeStyle = (token) => {
  const {
    componentCls,
    bodyPaddingSM,
    headerPaddingSM,
    headerHeightSM,
    headerFontSizeSM
  } = token;
  return {
    [`${componentCls}-small`]: {
      [`> ${componentCls}-head`]: {
        minHeight: headerHeightSM,
        padding: `0 ${unit(headerPaddingSM)}`,
        fontSize: headerFontSizeSM,
        [`> ${componentCls}-head-wrapper`]: {
          [`> ${componentCls}-extra`]: {
            fontSize: token.fontSize
          }
        }
      },
      [`> ${componentCls}-body`]: {
        padding: bodyPaddingSM
      }
    },
    [`${componentCls}-small${componentCls}-contain-tabs`]: {
      [`> ${componentCls}-head`]: {
        [`${componentCls}-head-title, ${componentCls}-extra`]: {
          paddingTop: 0,
          display: "flex",
          alignItems: "center"
        }
      }
    }
  };
};
var prepareComponentToken3 = (token) => {
  var _a, _b;
  return {
    headerBg: "transparent",
    headerFontSize: token.fontSizeLG,
    headerFontSizeSM: token.fontSize,
    headerHeight: token.fontSizeLG * token.lineHeightLG + token.padding * 2,
    headerHeightSM: token.fontSize * token.lineHeight + token.paddingXS * 2,
    actionsBg: token.colorBgContainer,
    actionsLiMargin: `${token.paddingSM}px 0`,
    tabsMarginBottom: -token.padding - token.lineWidth,
    extraColor: token.colorText,
    bodyPaddingSM: 12,
    // Fixed padding.
    headerPaddingSM: 12,
    bodyPadding: (_a = token.bodyPadding) !== null && _a !== void 0 ? _a : token.paddingLG,
    headerPadding: (_b = token.headerPadding) !== null && _b !== void 0 ? _b : token.paddingLG
  };
};
var style_default3 = genStyleHooks("Card", (token) => {
  const cardToken = merge2(token, {
    cardShadow: token.boxShadowCard,
    cardHeadPadding: token.padding,
    cardPaddingBase: token.paddingLG,
    cardActionsIconSize: token.fontSize
  });
  return [
    // Style
    genCardStyle2(cardToken),
    // Size
    genCardSizeStyle(cardToken)
  ];
}, prepareComponentToken3);

// node_modules/antd/es/form/hooks/useVariants.js
var React107 = __toESM(require_react());

// node_modules/antd/es/form/context.js
var React106 = __toESM(require_react());

// node_modules/rc-field-form/es/index.js
var React105 = __toESM(require_react());

// node_modules/@babel/runtime/helpers/esm/OverloadYield.js
function _OverloadYield(e, d) {
  this.v = e, this.k = d;
}

// node_modules/@babel/runtime/helpers/esm/regeneratorDefine.js
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e2) {
    i = 0;
  }
  _regeneratorDefine = function regeneratorDefine(e2, r2, n2, t2) {
    if (r2) i ? i(e2, r2, {
      value: n2,
      enumerable: !t2,
      configurable: !t2,
      writable: !t2
    }) : e2[r2] = n2;
    else {
      var o = function o2(r3, n3) {
        _regeneratorDefine(e2, r3, function(e3) {
          return this._invoke(r3, n3, e3);
        });
      };
      o("next", 0), o("throw", 1), o("return", 2);
    }
  }, _regeneratorDefine(e, r, n, t);
}

// node_modules/@babel/runtime/helpers/esm/regenerator.js
function _regenerator() {
  var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag";
  function i(r2, n2, o2, i2) {
    var c2 = n2 && n2.prototype instanceof Generator ? n2 : Generator, u2 = Object.create(c2.prototype);
    return _regeneratorDefine(u2, "_invoke", function(r3, n3, o3) {
      var i3, c3, u3, f2 = 0, p = o3 || [], y = false, G = {
        p: 0,
        n: 0,
        v: e,
        a: d,
        f: d.bind(e, 4),
        d: function d2(t2, r4) {
          return i3 = t2, c3 = 0, u3 = e, G.n = r4, a;
        }
      };
      function d(r4, n4) {
        for (c3 = r4, u3 = n4, t = 0; !y && f2 && !o4 && t < p.length; t++) {
          var o4, i4 = p[t], d2 = G.p, l = i4[2];
          r4 > 3 ? (o4 = l === n4) && (u3 = i4[(c3 = i4[4]) ? 5 : (c3 = 3, 3)], i4[4] = i4[5] = e) : i4[0] <= d2 && ((o4 = r4 < 2 && d2 < i4[1]) ? (c3 = 0, G.v = n4, G.n = i4[1]) : d2 < l && (o4 = r4 < 3 || i4[0] > n4 || n4 > l) && (i4[4] = r4, i4[5] = n4, G.n = l, c3 = 0));
        }
        if (o4 || r4 > 1) return a;
        throw y = true, n4;
      }
      return function(o4, p2, l) {
        if (f2 > 1) throw TypeError("Generator is already running");
        for (y && 1 === p2 && d(p2, l), c3 = p2, u3 = l; (t = c3 < 2 ? e : u3) || !y; ) {
          i3 || (c3 ? c3 < 3 ? (c3 > 1 && (G.n = -1), d(c3, u3)) : G.n = u3 : G.v = u3);
          try {
            if (f2 = 2, i3) {
              if (c3 || (o4 = "next"), t = i3[o4]) {
                if (!(t = t.call(i3, u3))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u3 = t.value, c3 < 2 && (c3 = 0);
              } else 1 === c3 && (t = i3["return"]) && t.call(i3), c3 < 2 && (u3 = TypeError("The iterator does not provide a '" + o4 + "' method"), c3 = 1);
              i3 = e;
            } else if ((t = (y = G.n < 0) ? u3 : r3.call(n3, G)) !== a) break;
          } catch (t2) {
            i3 = e, c3 = 1, u3 = t2;
          } finally {
            f2 = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r2, o2, i2), true), u2;
  }
  var a = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function() {
    return this;
  }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e2) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e2, GeneratorFunctionPrototype) : (e2.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e2, o, "GeneratorFunction")), e2.prototype = Object.create(u), e2;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function() {
    return this;
  }), _regeneratorDefine(u, "toString", function() {
    return "[object Generator]";
  }), (_regenerator = function _regenerator2() {
    return {
      w: i,
      m: f
    };
  })();
}

// node_modules/@babel/runtime/helpers/esm/regeneratorAsyncIterator.js
function AsyncIterator(t, e) {
  function n(r2, o, i, f) {
    try {
      var c = t[r2](o), u = c.value;
      return u instanceof _OverloadYield ? e.resolve(u.v).then(function(t2) {
        n("next", t2, i, f);
      }, function(t2) {
        n("throw", t2, i, f);
      }) : e.resolve(u).then(function(t2) {
        c.value = t2, i(c);
      }, function(t2) {
        return n("throw", t2, i, f);
      });
    } catch (t2) {
      f(t2);
    }
  }
  var r;
  this.next || (_regeneratorDefine(AsyncIterator.prototype), _regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
    return this;
  })), _regeneratorDefine(this, "_invoke", function(t2, o, i) {
    function f() {
      return new e(function(e2, r2) {
        n(t2, i, e2, r2);
      });
    }
    return r = r ? r.then(f, f) : f();
  }, true);
}

// node_modules/@babel/runtime/helpers/esm/regeneratorAsyncGen.js
function _regeneratorAsyncGen(r, e, t, o, n) {
  return new AsyncIterator(_regenerator().w(r, e, t, o), n || Promise);
}

// node_modules/@babel/runtime/helpers/esm/regeneratorAsync.js
function _regeneratorAsync(n, e, r, t, o) {
  var a = _regeneratorAsyncGen(n, e, r, t, o);
  return a.next().then(function(n2) {
    return n2.done ? n2.value : a.next();
  });
}

// node_modules/@babel/runtime/helpers/esm/regeneratorKeys.js
function _regeneratorKeys(e) {
  var n = Object(e), r = [];
  for (var t in n) r.unshift(t);
  return function e2() {
    for (; r.length; ) if ((t = r.pop()) in n) return e2.value = t, e2.done = false, e2;
    return e2.done = true, e2;
  };
}

// node_modules/@babel/runtime/helpers/esm/regeneratorValues.js
function _regeneratorValues(e) {
  if (null != e) {
    var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0;
    if (t) return t.call(e);
    if ("function" == typeof e.next) return e;
    if (!isNaN(e.length)) return {
      next: function next() {
        return e && r >= e.length && (e = void 0), {
          value: e && e[r++],
          done: !e
        };
      }
    };
  }
  throw new TypeError(_typeof(e) + " is not iterable");
}

// node_modules/@babel/runtime/helpers/esm/regeneratorRuntime.js
function _regeneratorRuntime() {
  "use strict";
  var r = _regenerator(), e = r.m(_regeneratorRuntime), t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
  function n(r2) {
    var e2 = "function" == typeof r2 && r2.constructor;
    return !!e2 && (e2 === t || "GeneratorFunction" === (e2.displayName || e2.name));
  }
  var o = {
    "throw": 1,
    "return": 2,
    "break": 3,
    "continue": 3
  };
  function a(r2) {
    var e2, t2;
    return function(n2) {
      e2 || (e2 = {
        stop: function stop() {
          return t2(n2.a, 2);
        },
        "catch": function _catch() {
          return n2.v;
        },
        abrupt: function abrupt(r3, e3) {
          return t2(n2.a, o[r3], e3);
        },
        delegateYield: function delegateYield(r3, o2, a2) {
          return e2.resultName = o2, t2(n2.d, _regeneratorValues(r3), a2);
        },
        finish: function finish(r3) {
          return t2(n2.f, r3);
        }
      }, t2 = function t3(r3, _t, o2) {
        n2.p = e2.prev, n2.n = e2.next;
        try {
          return r3(_t, o2);
        } finally {
          e2.next = n2.n;
        }
      }), e2.resultName && (e2[e2.resultName] = n2.v, e2.resultName = void 0), e2.sent = n2.v, e2.next = n2.n;
      try {
        return r2.call(this, e2);
      } finally {
        n2.p = e2.prev, n2.n = e2.next;
      }
    };
  }
  return (_regeneratorRuntime = function _regeneratorRuntime2() {
    return {
      wrap: function wrap(e2, t2, n2, o2) {
        return r.w(a(e2), t2, n2, o2 && o2.reverse());
      },
      isGeneratorFunction: n,
      mark: r.m,
      awrap: function awrap(r2, e2) {
        return new _OverloadYield(r2, e2);
      },
      AsyncIterator,
      async: function async(r2, e2, t2, o2, u) {
        return (n(e2) ? _regeneratorAsyncGen : _regeneratorAsync)(a(r2), e2, t2, o2, u);
      },
      keys: _regeneratorKeys,
      values: _regeneratorValues
    };
  })();
}

// node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c), u = i.value;
  } catch (n2) {
    return void e(n2);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function() {
    var t = this, e = arguments;
    return new Promise(function(r, o) {
      var a = n.apply(t, e);
      function _next(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n2);
      }
      function _throw(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n2);
      }
      _next(void 0);
    });
  };
}

// node_modules/rc-field-form/es/Field.js
var React100 = __toESM(require_react());

// node_modules/rc-field-form/es/FieldContext.js
var React97 = __toESM(require_react());
var HOOK_MARK = "RC_FORM_INTERNAL_HOOKS";
var warningFunc = function warningFunc2() {
  warning_default(false, "Can not find FormContext. Please make sure you wrap Field under Form.");
};
var Context2 = React97.createContext({
  getFieldValue: warningFunc,
  getFieldsValue: warningFunc,
  getFieldError: warningFunc,
  getFieldWarning: warningFunc,
  getFieldsError: warningFunc,
  isFieldsTouched: warningFunc,
  isFieldTouched: warningFunc,
  isFieldValidating: warningFunc,
  isFieldsValidating: warningFunc,
  resetFields: warningFunc,
  setFields: warningFunc,
  setFieldValue: warningFunc,
  setFieldsValue: warningFunc,
  validateFields: warningFunc,
  submit: warningFunc,
  getInternalHooks: function getInternalHooks() {
    warningFunc();
    return {
      dispatch: warningFunc,
      initEntityValue: warningFunc,
      registerField: warningFunc,
      useSubscribe: warningFunc,
      setInitialValues: warningFunc,
      destroyForm: warningFunc,
      setCallbacks: warningFunc,
      registerWatch: warningFunc,
      getFields: warningFunc,
      setValidateMessages: warningFunc,
      setPreserve: warningFunc,
      getInitialValue: warningFunc
    };
  }
});
var FieldContext_default = Context2;

// node_modules/rc-field-form/es/ListContext.js
var React98 = __toESM(require_react());
var ListContext = React98.createContext(null);
var ListContext_default = ListContext;

// node_modules/rc-field-form/es/utils/typeUtil.js
function toArray3(value) {
  if (value === void 0 || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
function isFormInstance(form) {
  return form && !!form._init;
}

// node_modules/@rc-component/async-validator/es/messages.js
function newMessages() {
  return {
    default: "Validation error on field %s",
    required: "%s is required",
    enum: "%s must be one of %s",
    whitespace: "%s cannot be empty",
    date: {
      format: "%s date %s is invalid for format %s",
      parse: "%s date could not be parsed, %s is invalid ",
      invalid: "%s date %s is invalid"
    },
    types: {
      string: "%s is not a %s",
      method: "%s is not a %s (function)",
      array: "%s is not an %s",
      object: "%s is not an %s",
      number: "%s is not a %s",
      date: "%s is not a %s",
      boolean: "%s is not a %s",
      integer: "%s is not an %s",
      float: "%s is not a %s",
      regexp: "%s is not a valid %s",
      email: "%s is not a valid %s",
      url: "%s is not a valid %s",
      hex: "%s is not a valid %s"
    },
    string: {
      len: "%s must be exactly %s characters",
      min: "%s must be at least %s characters",
      max: "%s cannot be longer than %s characters",
      range: "%s must be between %s and %s characters"
    },
    number: {
      len: "%s must equal %s",
      min: "%s cannot be less than %s",
      max: "%s cannot be greater than %s",
      range: "%s must be between %s and %s"
    },
    array: {
      len: "%s must be exactly %s in length",
      min: "%s cannot be less than %s in length",
      max: "%s cannot be greater than %s in length",
      range: "%s must be between %s and %s in length"
    },
    pattern: {
      mismatch: "%s value %s does not match pattern %s"
    },
    clone: function clone() {
      var cloned = JSON.parse(JSON.stringify(this));
      cloned.clone = this.clone;
      return cloned;
    }
  };
}
var messages = newMessages();

// node_modules/@babel/runtime/helpers/esm/isNativeFunction.js
function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}

// node_modules/@babel/runtime/helpers/esm/construct.js
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}

// node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js
function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return _wrapNativeSuper = function _wrapNativeSuper2(t2) {
    if (null === t2 || !_isNativeFunction(t2)) return t2;
    if ("function" != typeof t2) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t2)) return r.get(t2);
      r.set(t2, Wrapper);
    }
    function Wrapper() {
      return _construct(t2, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t2.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }), _setPrototypeOf(Wrapper, t2);
  }, _wrapNativeSuper(t);
}

// node_modules/@rc-component/async-validator/es/util.js
var formatRegExp = /%[sdj%]/g;
var warning3 = function warning4() {
};
if (typeof process !== "undefined" && process.env && true && typeof window !== "undefined" && typeof document !== "undefined") {
  warning3 = function warning5(type5, errors) {
    if (typeof console !== "undefined" && console.warn && typeof ASYNC_VALIDATOR_NO_WARNING === "undefined") {
      if (errors.every(function(e) {
        return typeof e === "string";
      })) {
        console.warn(type5, errors);
      }
    }
  };
}
function convertFieldsError(errors) {
  if (!errors || !errors.length) return null;
  var fields = {};
  errors.forEach(function(error) {
    var field = error.field;
    fields[field] = fields[field] || [];
    fields[field].push(error);
  });
  return fields;
}
function format(template) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  var i = 0;
  var len = args.length;
  if (typeof template === "function") {
    return template.apply(null, args);
  }
  if (typeof template === "string") {
    var str = template.replace(formatRegExp, function(x) {
      if (x === "%%") {
        return "%";
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case "%s":
          return String(args[i++]);
        case "%d":
          return Number(args[i++]);
        case "%j":
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return "[Circular]";
          }
          break;
        default:
          return x;
      }
    });
    return str;
  }
  return template;
}
function isNativeStringType(type5) {
  return type5 === "string" || type5 === "url" || type5 === "hex" || type5 === "email" || type5 === "date" || type5 === "pattern";
}
function isEmptyValue(value, type5) {
  if (value === void 0 || value === null) {
    return true;
  }
  if (type5 === "array" && Array.isArray(value) && !value.length) {
    return true;
  }
  if (isNativeStringType(type5) && typeof value === "string" && !value) {
    return true;
  }
  return false;
}
function asyncParallelArray(arr, func, callback) {
  var results = [];
  var total = 0;
  var arrLength = arr.length;
  function count(errors) {
    results.push.apply(results, _toConsumableArray(errors || []));
    total++;
    if (total === arrLength) {
      callback(results);
    }
  }
  arr.forEach(function(a) {
    func(a, count);
  });
}
function asyncSerialArray(arr, func, callback) {
  var index2 = 0;
  var arrLength = arr.length;
  function next(errors) {
    if (errors && errors.length) {
      callback(errors);
      return;
    }
    var original = index2;
    index2 = index2 + 1;
    if (original < arrLength) {
      func(arr[original], next);
    } else {
      callback([]);
    }
  }
  next([]);
}
function flattenObjArr(objArr) {
  var ret = [];
  Object.keys(objArr).forEach(function(k) {
    ret.push.apply(ret, _toConsumableArray(objArr[k] || []));
  });
  return ret;
}
var AsyncValidationError = function(_Error) {
  _inherits(AsyncValidationError2, _Error);
  var _super = _createSuper(AsyncValidationError2);
  function AsyncValidationError2(errors, fields) {
    var _this;
    _classCallCheck(this, AsyncValidationError2);
    _this = _super.call(this, "Async Validation Error");
    _defineProperty(_assertThisInitialized(_this), "errors", void 0);
    _defineProperty(_assertThisInitialized(_this), "fields", void 0);
    _this.errors = errors;
    _this.fields = fields;
    return _this;
  }
  return _createClass(AsyncValidationError2);
}(_wrapNativeSuper(Error));
function asyncMap(objArr, option, func, callback, source) {
  if (option.first) {
    var _pending = new Promise(function(resolve, reject) {
      var next = function next2(errors) {
        callback(errors);
        return errors.length ? reject(new AsyncValidationError(errors, convertFieldsError(errors))) : resolve(source);
      };
      var flattenArr = flattenObjArr(objArr);
      asyncSerialArray(flattenArr, func, next);
    });
    _pending.catch(function(e) {
      return e;
    });
    return _pending;
  }
  var firstFields = option.firstFields === true ? Object.keys(objArr) : option.firstFields || [];
  var objArrKeys = Object.keys(objArr);
  var objArrLength = objArrKeys.length;
  var total = 0;
  var results = [];
  var pending = new Promise(function(resolve, reject) {
    var next = function next2(errors) {
      results.push.apply(results, errors);
      total++;
      if (total === objArrLength) {
        callback(results);
        return results.length ? reject(new AsyncValidationError(results, convertFieldsError(results))) : resolve(source);
      }
    };
    if (!objArrKeys.length) {
      callback(results);
      resolve(source);
    }
    objArrKeys.forEach(function(key) {
      var arr = objArr[key];
      if (firstFields.indexOf(key) !== -1) {
        asyncSerialArray(arr, func, next);
      } else {
        asyncParallelArray(arr, func, next);
      }
    });
  });
  pending.catch(function(e) {
    return e;
  });
  return pending;
}
function isErrorObj(obj) {
  return !!(obj && obj.message !== void 0);
}
function getValue(value, path2) {
  var v = value;
  for (var i = 0; i < path2.length; i++) {
    if (v == void 0) {
      return v;
    }
    v = v[path2[i]];
  }
  return v;
}
function complementError(rule, source) {
  return function(oe) {
    var fieldValue;
    if (rule.fullFields) {
      fieldValue = getValue(source, rule.fullFields);
    } else {
      fieldValue = source[oe.field || rule.fullField];
    }
    if (isErrorObj(oe)) {
      oe.field = oe.field || rule.fullField;
      oe.fieldValue = fieldValue;
      return oe;
    }
    return {
      message: typeof oe === "function" ? oe() : oe,
      fieldValue,
      field: oe.field || rule.fullField
    };
  };
}
function deepMerge(target, source) {
  if (source) {
    for (var s in source) {
      if (source.hasOwnProperty(s)) {
        var value = source[s];
        if (_typeof(value) === "object" && _typeof(target[s]) === "object") {
          target[s] = _objectSpread2(_objectSpread2({}, target[s]), value);
        } else {
          target[s] = value;
        }
      }
    }
  }
  return target;
}

// node_modules/@rc-component/async-validator/es/rule/enum.js
var ENUM = "enum";
var enumerable = function enumerable2(rule, value, source, errors, options) {
  rule[ENUM] = Array.isArray(rule[ENUM]) ? rule[ENUM] : [];
  if (rule[ENUM].indexOf(value) === -1) {
    errors.push(format(options.messages[ENUM], rule.fullField, rule[ENUM].join(", ")));
  }
};
var enum_default = enumerable;

// node_modules/@rc-component/async-validator/es/rule/pattern.js
var pattern = function pattern2(rule, value, source, errors, options) {
  if (rule.pattern) {
    if (rule.pattern instanceof RegExp) {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(value)) {
        errors.push(format(options.messages.pattern.mismatch, rule.fullField, value, rule.pattern));
      }
    } else if (typeof rule.pattern === "string") {
      var _pattern = new RegExp(rule.pattern);
      if (!_pattern.test(value)) {
        errors.push(format(options.messages.pattern.mismatch, rule.fullField, value, rule.pattern));
      }
    }
  }
};
var pattern_default = pattern;

// node_modules/@rc-component/async-validator/es/rule/range.js
var range = function range2(rule, value, source, errors, options) {
  var len = typeof rule.len === "number";
  var min = typeof rule.min === "number";
  var max = typeof rule.max === "number";
  var spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  var val = value;
  var key = null;
  var num = typeof value === "number";
  var str = typeof value === "string";
  var arr = Array.isArray(value);
  if (num) {
    key = "number";
  } else if (str) {
    key = "string";
  } else if (arr) {
    key = "array";
  }
  if (!key) {
    return false;
  }
  if (arr) {
    val = value.length;
  }
  if (str) {
    val = value.replace(spRegexp, "_").length;
  }
  if (len) {
    if (val !== rule.len) {
      errors.push(format(options.messages[key].len, rule.fullField, rule.len));
    }
  } else if (min && !max && val < rule.min) {
    errors.push(format(options.messages[key].min, rule.fullField, rule.min));
  } else if (max && !min && val > rule.max) {
    errors.push(format(options.messages[key].max, rule.fullField, rule.max));
  } else if (min && max && (val < rule.min || val > rule.max)) {
    errors.push(format(options.messages[key].range, rule.fullField, rule.min, rule.max));
  }
};
var range_default = range;

// node_modules/@rc-component/async-validator/es/rule/required.js
var required = function required2(rule, value, source, errors, options, type5) {
  if (rule.required && (!source.hasOwnProperty(rule.field) || isEmptyValue(value, type5 || rule.type))) {
    errors.push(format(options.messages.required, rule.fullField));
  }
};
var required_default = required;

// node_modules/@rc-component/async-validator/es/rule/url.js
var urlReg;
var url_default = function() {
  if (urlReg) {
    return urlReg;
  }
  var word = "[a-fA-F\\d:]";
  var b = function b2(options) {
    return options && options.includeBoundaries ? "(?:(?<=\\s|^)(?=".concat(word, ")|(?<=").concat(word, ")(?=\\s|$))") : "";
  };
  var v4 = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}";
  var v6seg = "[a-fA-F\\d]{1,4}";
  var v6List = [
    "(?:".concat(v6seg, ":){7}(?:").concat(v6seg, "|:)"),
    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
    "(?:".concat(v6seg, ":){6}(?:").concat(v4, "|:").concat(v6seg, "|:)"),
    // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::
    "(?:".concat(v6seg, ":){5}(?::").concat(v4, "|(?::").concat(v6seg, "){1,2}|:)"),
    // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::
    "(?:".concat(v6seg, ":){4}(?:(?::").concat(v6seg, "){0,1}:").concat(v4, "|(?::").concat(v6seg, "){1,3}|:)"),
    // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::
    "(?:".concat(v6seg, ":){3}(?:(?::").concat(v6seg, "){0,2}:").concat(v4, "|(?::").concat(v6seg, "){1,4}|:)"),
    // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::
    "(?:".concat(v6seg, ":){2}(?:(?::").concat(v6seg, "){0,3}:").concat(v4, "|(?::").concat(v6seg, "){1,5}|:)"),
    // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::
    "(?:".concat(v6seg, ":){1}(?:(?::").concat(v6seg, "){0,4}:").concat(v4, "|(?::").concat(v6seg, "){1,6}|:)"),
    // 1::              1::3:4:5:6:7:8   1::8            1::
    "(?::(?:(?::".concat(v6seg, "){0,5}:").concat(v4, "|(?::").concat(v6seg, "){1,7}|:))")
    // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::
  ];
  var v6Eth0 = "(?:%[0-9a-zA-Z]{1,})?";
  var v6 = "(?:".concat(v6List.join("|"), ")").concat(v6Eth0);
  var v46Exact = new RegExp("(?:^".concat(v4, "$)|(?:^").concat(v6, "$)"));
  var v4exact = new RegExp("^".concat(v4, "$"));
  var v6exact = new RegExp("^".concat(v6, "$"));
  var ip = function ip2(options) {
    return options && options.exact ? v46Exact : new RegExp("(?:".concat(b(options)).concat(v4).concat(b(options), ")|(?:").concat(b(options)).concat(v6).concat(b(options), ")"), "g");
  };
  ip.v4 = function(options) {
    return options && options.exact ? v4exact : new RegExp("".concat(b(options)).concat(v4).concat(b(options)), "g");
  };
  ip.v6 = function(options) {
    return options && options.exact ? v6exact : new RegExp("".concat(b(options)).concat(v6).concat(b(options)), "g");
  };
  var protocol = "(?:(?:[a-z]+:)?//)";
  var auth = "(?:\\S+(?::\\S*)?@)?";
  var ipv4 = ip.v4().source;
  var ipv6 = ip.v6().source;
  var host = "(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)";
  var domain = "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*";
  var tld = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";
  var port = "(?::\\d{2,5})?";
  var path2 = '(?:[/?#][^\\s"]*)?';
  var regex = "(?:".concat(protocol, "|www\\.)").concat(auth, "(?:localhost|").concat(ipv4, "|").concat(ipv6, "|").concat(host).concat(domain).concat(tld, ")").concat(port).concat(path2);
  urlReg = new RegExp("(?:^".concat(regex, "$)"), "i");
  return urlReg;
};

// node_modules/@rc-component/async-validator/es/rule/type.js
var pattern3 = {
  // http://emailregex.com/
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/,
  // url: new RegExp(
  //   '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  //   'i',
  // ),
  hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
};
var types = {
  integer: function integer(value) {
    return types.number(value) && parseInt(value, 10) === value;
  },
  float: function float(value) {
    return types.number(value) && !types.integer(value);
  },
  array: function array(value) {
    return Array.isArray(value);
  },
  regexp: function regexp(value) {
    if (value instanceof RegExp) {
      return true;
    }
    try {
      return !!new RegExp(value);
    } catch (e) {
      return false;
    }
  },
  date: function date(value) {
    return typeof value.getTime === "function" && typeof value.getMonth === "function" && typeof value.getYear === "function" && !isNaN(value.getTime());
  },
  number: function number(value) {
    if (isNaN(value)) {
      return false;
    }
    return typeof value === "number";
  },
  object: function object(value) {
    return _typeof(value) === "object" && !types.array(value);
  },
  method: function method(value) {
    return typeof value === "function";
  },
  email: function email(value) {
    return typeof value === "string" && value.length <= 320 && !!value.match(pattern3.email);
  },
  url: function url(value) {
    return typeof value === "string" && value.length <= 2048 && !!value.match(url_default());
  },
  hex: function hex(value) {
    return typeof value === "string" && !!value.match(pattern3.hex);
  }
};
var type = function type2(rule, value, source, errors, options) {
  if (rule.required && value === void 0) {
    required_default(rule, value, source, errors, options);
    return;
  }
  var custom = ["integer", "float", "array", "regexp", "object", "method", "email", "number", "date", "url", "hex"];
  var ruleType = rule.type;
  if (custom.indexOf(ruleType) > -1) {
    if (!types[ruleType](value)) {
      errors.push(format(options.messages.types[ruleType], rule.fullField, rule.type));
    }
  } else if (ruleType && _typeof(value) !== rule.type) {
    errors.push(format(options.messages.types[ruleType], rule.fullField, rule.type));
  }
};
var type_default = type;

// node_modules/@rc-component/async-validator/es/rule/whitespace.js
var whitespace = function whitespace2(rule, value, source, errors, options) {
  if (/^\s+$/.test(value) || value === "") {
    errors.push(format(options.messages.whitespace, rule.fullField));
  }
};
var whitespace_default = whitespace;

// node_modules/@rc-component/async-validator/es/rule/index.js
var rule_default = {
  required: required_default,
  whitespace: whitespace_default,
  type: type_default,
  range: range_default,
  enum: enum_default,
  pattern: pattern_default
};

// node_modules/@rc-component/async-validator/es/validator/any.js
var any = function any2(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
  }
  callback(errors);
};
var any_default = any;

// node_modules/@rc-component/async-validator/es/validator/array.js
var array2 = function array3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if ((value === void 0 || value === null) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options, "array");
    if (value !== void 0 && value !== null) {
      rule_default.type(rule, value, source, errors, options);
      rule_default.range(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var array_default = array2;

// node_modules/@rc-component/async-validator/es/validator/boolean.js
var boolean = function boolean2(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var boolean_default = boolean;

// node_modules/@rc-component/async-validator/es/validator/date.js
var date2 = function date3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value, "date") && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (!isEmptyValue(value, "date")) {
      var dateObject;
      if (value instanceof Date) {
        dateObject = value;
      } else {
        dateObject = new Date(value);
      }
      rule_default.type(rule, dateObject, source, errors, options);
      if (dateObject) {
        rule_default.range(rule, dateObject.getTime(), source, errors, options);
      }
    }
  }
  callback(errors);
};
var date_default = date2;

// node_modules/@rc-component/async-validator/es/validator/enum.js
var ENUM2 = "enum";
var enumerable3 = function enumerable4(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default[ENUM2](rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var enum_default2 = enumerable3;

// node_modules/@rc-component/async-validator/es/validator/float.js
var floatFn = function floatFn2(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
      rule_default.range(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var float_default = floatFn;

// node_modules/@rc-component/async-validator/es/validator/integer.js
var integer2 = function integer3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
      rule_default.range(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var integer_default = integer2;

// node_modules/@rc-component/async-validator/es/validator/method.js
var method2 = function method3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var method_default = method2;

// node_modules/@rc-component/async-validator/es/validator/number.js
var number2 = function number3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (value === "") {
      value = void 0;
    }
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
      rule_default.range(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var number_default = number2;

// node_modules/@rc-component/async-validator/es/validator/object.js
var object2 = function object3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (value !== void 0) {
      rule_default.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var object_default = object2;

// node_modules/@rc-component/async-validator/es/validator/pattern.js
var pattern4 = function pattern5(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value, "string") && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (!isEmptyValue(value, "string")) {
      rule_default.pattern(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var pattern_default2 = pattern4;

// node_modules/@rc-component/async-validator/es/validator/regexp.js
var regexp2 = function regexp3(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options);
    if (!isEmptyValue(value)) {
      rule_default.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var regexp_default = regexp2;

// node_modules/@rc-component/async-validator/es/validator/required.js
var required3 = function required4(rule, value, callback, source, options) {
  var errors = [];
  var type5 = Array.isArray(value) ? "array" : _typeof(value);
  rule_default.required(rule, value, source, errors, options, type5);
  callback(errors);
};
var required_default2 = required3;

// node_modules/@rc-component/async-validator/es/validator/string.js
var string = function string2(rule, value, callback, source, options) {
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value, "string") && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options, "string");
    if (!isEmptyValue(value, "string")) {
      rule_default.type(rule, value, source, errors, options);
      rule_default.range(rule, value, source, errors, options);
      rule_default.pattern(rule, value, source, errors, options);
      if (rule.whitespace === true) {
        rule_default.whitespace(rule, value, source, errors, options);
      }
    }
  }
  callback(errors);
};
var string_default = string;

// node_modules/@rc-component/async-validator/es/validator/type.js
var type3 = function type4(rule, value, callback, source, options) {
  var ruleType = rule.type;
  var errors = [];
  var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);
  if (validate) {
    if (isEmptyValue(value, ruleType) && !rule.required) {
      return callback();
    }
    rule_default.required(rule, value, source, errors, options, ruleType);
    if (!isEmptyValue(value, ruleType)) {
      rule_default.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
};
var type_default2 = type3;

// node_modules/@rc-component/async-validator/es/validator/index.js
var validator_default = {
  string: string_default,
  method: method_default,
  number: number_default,
  boolean: boolean_default,
  regexp: regexp_default,
  integer: integer_default,
  float: float_default,
  array: array_default,
  object: object_default,
  enum: enum_default2,
  pattern: pattern_default2,
  date: date_default,
  url: type_default2,
  hex: type_default2,
  email: type_default2,
  required: required_default2,
  any: any_default
};

// node_modules/@rc-component/async-validator/es/index.js
var Schema = function() {
  function Schema2(descriptor) {
    _classCallCheck(this, Schema2);
    _defineProperty(this, "rules", null);
    _defineProperty(this, "_messages", messages);
    this.define(descriptor);
  }
  _createClass(Schema2, [{
    key: "define",
    value: function define(rules) {
      var _this = this;
      if (!rules) {
        throw new Error("Cannot configure a schema with no rules");
      }
      if (_typeof(rules) !== "object" || Array.isArray(rules)) {
        throw new Error("Rules must be an object");
      }
      this.rules = {};
      Object.keys(rules).forEach(function(name) {
        var item = rules[name];
        _this.rules[name] = Array.isArray(item) ? item : [item];
      });
    }
  }, {
    key: "messages",
    value: function messages2(_messages) {
      if (_messages) {
        this._messages = deepMerge(newMessages(), _messages);
      }
      return this._messages;
    }
  }, {
    key: "validate",
    value: function validate(source_) {
      var _this2 = this;
      var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      var oc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function() {
      };
      var source = source_;
      var options = o;
      var callback = oc;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (!this.rules || Object.keys(this.rules).length === 0) {
        if (callback) {
          callback(null, source);
        }
        return Promise.resolve(source);
      }
      function complete(results) {
        var errors = [];
        var fields = {};
        function add(e) {
          if (Array.isArray(e)) {
            var _errors;
            errors = (_errors = errors).concat.apply(_errors, _toConsumableArray(e));
          } else {
            errors.push(e);
          }
        }
        for (var i = 0; i < results.length; i++) {
          add(results[i]);
        }
        if (!errors.length) {
          callback(null, source);
        } else {
          fields = convertFieldsError(errors);
          callback(errors, fields);
        }
      }
      if (options.messages) {
        var messages2 = this.messages();
        if (messages2 === messages) {
          messages2 = newMessages();
        }
        deepMerge(messages2, options.messages);
        options.messages = messages2;
      } else {
        options.messages = this.messages();
      }
      var series = {};
      var keys = options.keys || Object.keys(this.rules);
      keys.forEach(function(z) {
        var arr = _this2.rules[z];
        var value = source[z];
        arr.forEach(function(r) {
          var rule = r;
          if (typeof rule.transform === "function") {
            if (source === source_) {
              source = _objectSpread2({}, source);
            }
            value = source[z] = rule.transform(value);
            if (value !== void 0 && value !== null) {
              rule.type = rule.type || (Array.isArray(value) ? "array" : _typeof(value));
            }
          }
          if (typeof rule === "function") {
            rule = {
              validator: rule
            };
          } else {
            rule = _objectSpread2({}, rule);
          }
          rule.validator = _this2.getValidationMethod(rule);
          if (!rule.validator) {
            return;
          }
          rule.field = z;
          rule.fullField = rule.fullField || z;
          rule.type = _this2.getType(rule);
          series[z] = series[z] || [];
          series[z].push({
            rule,
            value,
            source,
            field: z
          });
        });
      });
      var errorFields = {};
      return asyncMap(series, options, function(data, doIt) {
        var rule = data.rule;
        var deep = (rule.type === "object" || rule.type === "array") && (_typeof(rule.fields) === "object" || _typeof(rule.defaultField) === "object");
        deep = deep && (rule.required || !rule.required && data.value);
        rule.field = data.field;
        function addFullField(key, schema) {
          return _objectSpread2(_objectSpread2({}, schema), {}, {
            fullField: "".concat(rule.fullField, ".").concat(key),
            fullFields: rule.fullFields ? [].concat(_toConsumableArray(rule.fullFields), [key]) : [key]
          });
        }
        function cb() {
          var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
          var errorList = Array.isArray(e) ? e : [e];
          if (!options.suppressWarning && errorList.length) {
            Schema2.warning("async-validator:", errorList);
          }
          if (errorList.length && rule.message !== void 0) {
            errorList = [].concat(rule.message);
          }
          var filledErrors = errorList.map(complementError(rule, source));
          if (options.first && filledErrors.length) {
            errorFields[rule.field] = 1;
            return doIt(filledErrors);
          }
          if (!deep) {
            doIt(filledErrors);
          } else {
            if (rule.required && !data.value) {
              if (rule.message !== void 0) {
                filledErrors = [].concat(rule.message).map(complementError(rule, source));
              } else if (options.error) {
                filledErrors = [options.error(rule, format(options.messages.required, rule.field))];
              }
              return doIt(filledErrors);
            }
            var fieldsSchema = {};
            if (rule.defaultField) {
              Object.keys(data.value).map(function(key) {
                fieldsSchema[key] = rule.defaultField;
              });
            }
            fieldsSchema = _objectSpread2(_objectSpread2({}, fieldsSchema), data.rule.fields);
            var paredFieldsSchema = {};
            Object.keys(fieldsSchema).forEach(function(field) {
              var fieldSchema = fieldsSchema[field];
              var fieldSchemaList = Array.isArray(fieldSchema) ? fieldSchema : [fieldSchema];
              paredFieldsSchema[field] = fieldSchemaList.map(addFullField.bind(null, field));
            });
            var schema = new Schema2(paredFieldsSchema);
            schema.messages(options.messages);
            if (data.rule.options) {
              data.rule.options.messages = options.messages;
              data.rule.options.error = options.error;
            }
            schema.validate(data.value, data.rule.options || options, function(errs) {
              var finalErrors = [];
              if (filledErrors && filledErrors.length) {
                finalErrors.push.apply(finalErrors, _toConsumableArray(filledErrors));
              }
              if (errs && errs.length) {
                finalErrors.push.apply(finalErrors, _toConsumableArray(errs));
              }
              doIt(finalErrors.length ? finalErrors : null);
            });
          }
        }
        var res;
        if (rule.asyncValidator) {
          res = rule.asyncValidator(rule, data.value, cb, data.source, options);
        } else if (rule.validator) {
          try {
            res = rule.validator(rule, data.value, cb, data.source, options);
          } catch (error) {
            var _console$error, _console;
            (_console$error = (_console = console).error) === null || _console$error === void 0 || _console$error.call(_console, error);
            if (!options.suppressValidatorError) {
              setTimeout(function() {
                throw error;
              }, 0);
            }
            cb(error.message);
          }
          if (res === true) {
            cb();
          } else if (res === false) {
            cb(typeof rule.message === "function" ? rule.message(rule.fullField || rule.field) : rule.message || "".concat(rule.fullField || rule.field, " fails"));
          } else if (res instanceof Array) {
            cb(res);
          } else if (res instanceof Error) {
            cb(res.message);
          }
        }
        if (res && res.then) {
          res.then(function() {
            return cb();
          }, function(e) {
            return cb(e);
          });
        }
      }, function(results) {
        complete(results);
      }, source);
    }
  }, {
    key: "getType",
    value: function getType(rule) {
      if (rule.type === void 0 && rule.pattern instanceof RegExp) {
        rule.type = "pattern";
      }
      if (typeof rule.validator !== "function" && rule.type && !validator_default.hasOwnProperty(rule.type)) {
        throw new Error(format("Unknown rule type %s", rule.type));
      }
      return rule.type || "string";
    }
  }, {
    key: "getValidationMethod",
    value: function getValidationMethod(rule) {
      if (typeof rule.validator === "function") {
        return rule.validator;
      }
      var keys = Object.keys(rule);
      var messageIndex = keys.indexOf("message");
      if (messageIndex !== -1) {
        keys.splice(messageIndex, 1);
      }
      if (keys.length === 1 && keys[0] === "required") {
        return validator_default.required;
      }
      return validator_default[this.getType(rule)] || void 0;
    }
  }]);
  return Schema2;
}();
_defineProperty(Schema, "register", function register(type5, validator) {
  if (typeof validator !== "function") {
    throw new Error("Cannot register a validator by type, validator is not a function");
  }
  validator_default[type5] = validator;
});
_defineProperty(Schema, "warning", warning3);
_defineProperty(Schema, "messages", messages);
_defineProperty(Schema, "validators", validator_default);
var es_default9 = Schema;

// node_modules/rc-field-form/es/utils/validateUtil.js
var React99 = __toESM(require_react());

// node_modules/rc-field-form/es/utils/messages.js
var typeTemplate2 = "'${name}' is not a valid ${type}";
var defaultValidateMessages = {
  default: "Validation error on field '${name}'",
  required: "'${name}' is required",
  enum: "'${name}' must be one of [${enum}]",
  whitespace: "'${name}' cannot be empty",
  date: {
    format: "'${name}' is invalid for format date",
    parse: "'${name}' could not be parsed as date",
    invalid: "'${name}' is invalid date"
  },
  types: {
    string: typeTemplate2,
    method: typeTemplate2,
    array: typeTemplate2,
    object: typeTemplate2,
    number: typeTemplate2,
    date: typeTemplate2,
    boolean: typeTemplate2,
    integer: typeTemplate2,
    float: typeTemplate2,
    regexp: typeTemplate2,
    email: typeTemplate2,
    url: typeTemplate2,
    hex: typeTemplate2
  },
  string: {
    len: "'${name}' must be exactly ${len} characters",
    min: "'${name}' must be at least ${min} characters",
    max: "'${name}' cannot be longer than ${max} characters",
    range: "'${name}' must be between ${min} and ${max} characters"
  },
  number: {
    len: "'${name}' must equal ${len}",
    min: "'${name}' cannot be less than ${min}",
    max: "'${name}' cannot be greater than ${max}",
    range: "'${name}' must be between ${min} and ${max}"
  },
  array: {
    len: "'${name}' must be exactly ${len} in length",
    min: "'${name}' cannot be less than ${min} in length",
    max: "'${name}' cannot be greater than ${max} in length",
    range: "'${name}' must be between ${min} and ${max} in length"
  },
  pattern: {
    mismatch: "'${name}' does not match pattern ${pattern}"
  }
};

// node_modules/rc-field-form/es/utils/validateUtil.js
var AsyncValidator = es_default9;
function replaceMessage(template, kv) {
  return template.replace(/\\?\$\{\w+\}/g, function(str) {
    if (str.startsWith("\\")) {
      return str.slice(1);
    }
    var key = str.slice(2, -1);
    return kv[key];
  });
}
var CODE_LOGIC_ERROR = "CODE_LOGIC_ERROR";
function validateRule(_x, _x2, _x3, _x4, _x5) {
  return _validateRule.apply(this, arguments);
}
function _validateRule() {
  _validateRule = _asyncToGenerator(_regeneratorRuntime().mark(function _callee2(name, value, rule, options, messageVariables) {
    var cloneRule, originValidator, subRuleField, validator, messages2, result, subResults, kv, fillVariableResult;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          cloneRule = _objectSpread2({}, rule);
          delete cloneRule.ruleIndex;
          AsyncValidator.warning = function() {
            return void 0;
          };
          if (cloneRule.validator) {
            originValidator = cloneRule.validator;
            cloneRule.validator = function() {
              try {
                return originValidator.apply(void 0, arguments);
              } catch (error) {
                console.error(error);
                return Promise.reject(CODE_LOGIC_ERROR);
              }
            };
          }
          subRuleField = null;
          if (cloneRule && cloneRule.type === "array" && cloneRule.defaultField) {
            subRuleField = cloneRule.defaultField;
            delete cloneRule.defaultField;
          }
          validator = new AsyncValidator(_defineProperty({}, name, [cloneRule]));
          messages2 = merge(defaultValidateMessages, options.validateMessages);
          validator.messages(messages2);
          result = [];
          _context2.prev = 10;
          _context2.next = 13;
          return Promise.resolve(validator.validate(_defineProperty({}, name, value), _objectSpread2({}, options)));
        case 13:
          _context2.next = 18;
          break;
        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](10);
          if (_context2.t0.errors) {
            result = _context2.t0.errors.map(function(_ref4, index2) {
              var message = _ref4.message;
              var mergedMessage = message === CODE_LOGIC_ERROR ? messages2.default : message;
              return React99.isValidElement(mergedMessage) ? (
                // Wrap ReactNode with `key`
                React99.cloneElement(mergedMessage, {
                  key: "error_".concat(index2)
                })
              ) : mergedMessage;
            });
          }
        case 18:
          if (!(!result.length && subRuleField)) {
            _context2.next = 23;
            break;
          }
          _context2.next = 21;
          return Promise.all(value.map(function(subValue, i) {
            return validateRule("".concat(name, ".").concat(i), subValue, subRuleField, options, messageVariables);
          }));
        case 21:
          subResults = _context2.sent;
          return _context2.abrupt("return", subResults.reduce(function(prev, errors) {
            return [].concat(_toConsumableArray(prev), _toConsumableArray(errors));
          }, []));
        case 23:
          kv = _objectSpread2(_objectSpread2({}, rule), {}, {
            name,
            enum: (rule.enum || []).join(", ")
          }, messageVariables);
          fillVariableResult = result.map(function(error) {
            if (typeof error === "string") {
              return replaceMessage(error, kv);
            }
            return error;
          });
          return _context2.abrupt("return", fillVariableResult);
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[10, 15]]);
  }));
  return _validateRule.apply(this, arguments);
}
function validateRules(namePath, value, rules, options, validateFirst, messageVariables) {
  var name = namePath.join(".");
  var filledRules = rules.map(function(currentRule, ruleIndex) {
    var originValidatorFunc = currentRule.validator;
    var cloneRule = _objectSpread2(_objectSpread2({}, currentRule), {}, {
      ruleIndex
    });
    if (originValidatorFunc) {
      cloneRule.validator = function(rule, val, callback) {
        var hasPromise = false;
        var wrappedCallback = function wrappedCallback2() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          Promise.resolve().then(function() {
            warning_default(!hasPromise, "Your validator function has already return a promise. `callback` will be ignored.");
            if (!hasPromise) {
              callback.apply(void 0, args);
            }
          });
        };
        var promise = originValidatorFunc(rule, val, wrappedCallback);
        hasPromise = promise && typeof promise.then === "function" && typeof promise.catch === "function";
        warning_default(hasPromise, "`callback` is deprecated. Please return a promise instead.");
        if (hasPromise) {
          promise.then(function() {
            callback();
          }).catch(function(err) {
            callback(err || " ");
          });
        }
      };
    }
    return cloneRule;
  }).sort(function(_ref, _ref2) {
    var w1 = _ref.warningOnly, i1 = _ref.ruleIndex;
    var w2 = _ref2.warningOnly, i2 = _ref2.ruleIndex;
    if (!!w1 === !!w2) {
      return i1 - i2;
    }
    if (w1) {
      return 1;
    }
    return -1;
  });
  var summaryPromise;
  if (validateFirst === true) {
    summaryPromise = new Promise(function() {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(resolve, reject) {
        var i, rule, errors;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              i = 0;
            case 1:
              if (!(i < filledRules.length)) {
                _context.next = 12;
                break;
              }
              rule = filledRules[i];
              _context.next = 5;
              return validateRule(name, value, rule, options, messageVariables);
            case 5:
              errors = _context.sent;
              if (!errors.length) {
                _context.next = 9;
                break;
              }
              reject([{
                errors,
                rule
              }]);
              return _context.abrupt("return");
            case 9:
              i += 1;
              _context.next = 1;
              break;
            case 12:
              resolve([]);
            case 13:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function(_x6, _x7) {
        return _ref3.apply(this, arguments);
      };
    }());
  } else {
    var rulePromises = filledRules.map(function(rule) {
      return validateRule(name, value, rule, options, messageVariables).then(function(errors) {
        return {
          errors,
          rule
        };
      });
    });
    summaryPromise = (validateFirst ? finishOnFirstFailed(rulePromises) : finishOnAllFailed(rulePromises)).then(function(errors) {
      return Promise.reject(errors);
    });
  }
  summaryPromise.catch(function(e) {
    return e;
  });
  return summaryPromise;
}
function finishOnAllFailed(_x8) {
  return _finishOnAllFailed.apply(this, arguments);
}
function _finishOnAllFailed() {
  _finishOnAllFailed = _asyncToGenerator(_regeneratorRuntime().mark(function _callee3(rulePromises) {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", Promise.all(rulePromises).then(function(errorsList) {
            var _ref5;
            var errors = (_ref5 = []).concat.apply(_ref5, _toConsumableArray(errorsList));
            return errors;
          }));
        case 1:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _finishOnAllFailed.apply(this, arguments);
}
function finishOnFirstFailed(_x9) {
  return _finishOnFirstFailed.apply(this, arguments);
}
function _finishOnFirstFailed() {
  _finishOnFirstFailed = _asyncToGenerator(_regeneratorRuntime().mark(function _callee4(rulePromises) {
    var count;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          count = 0;
          return _context4.abrupt("return", new Promise(function(resolve) {
            rulePromises.forEach(function(promise) {
              promise.then(function(ruleError) {
                if (ruleError.errors.length) {
                  resolve([ruleError]);
                }
                count += 1;
                if (count === rulePromises.length) {
                  resolve([]);
                }
              });
            });
          }));
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _finishOnFirstFailed.apply(this, arguments);
}

// node_modules/rc-field-form/es/utils/valueUtil.js
function getNamePath(path2) {
  return toArray3(path2);
}
function cloneByNamePathList(store, namePathList) {
  var newStore = {};
  namePathList.forEach(function(namePath) {
    var value = get(store, namePath);
    newStore = set(newStore, namePath, value);
  });
  return newStore;
}
function containsNamePath(namePathList, namePath) {
  var partialMatch = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  return namePathList && namePathList.some(function(path2) {
    return matchNamePath(namePath, path2, partialMatch);
  });
}
function matchNamePath(namePath, subNamePath) {
  var partialMatch = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  if (!namePath || !subNamePath) {
    return false;
  }
  if (!partialMatch && namePath.length !== subNamePath.length) {
    return false;
  }
  return subNamePath.every(function(nameUnit, i) {
    return namePath[i] === nameUnit;
  });
}
function isSimilar(source, target) {
  if (source === target) {
    return true;
  }
  if (!source && target || source && !target) {
    return false;
  }
  if (!source || !target || _typeof(source) !== "object" || _typeof(target) !== "object") {
    return false;
  }
  var sourceKeys = Object.keys(source);
  var targetKeys = Object.keys(target);
  var keys = new Set([].concat(sourceKeys, targetKeys));
  return _toConsumableArray(keys).every(function(key) {
    var sourceValue = source[key];
    var targetValue = target[key];
    if (typeof sourceValue === "function" && typeof targetValue === "function") {
      return true;
    }
    return sourceValue === targetValue;
  });
}
function defaultGetValueFromEvent(valuePropName) {
  var event = arguments.length <= 1 ? void 0 : arguments[1];
  if (event && event.target && _typeof(event.target) === "object" && valuePropName in event.target) {
    return event.target[valuePropName];
  }
  return event;
}
function move(array4, moveIndex, toIndex) {
  var length = array4.length;
  if (moveIndex < 0 || moveIndex >= length || toIndex < 0 || toIndex >= length) {
    return array4;
  }
  var item = array4[moveIndex];
  var diff = moveIndex - toIndex;
  if (diff > 0) {
    return [].concat(_toConsumableArray(array4.slice(0, toIndex)), [item], _toConsumableArray(array4.slice(toIndex, moveIndex)), _toConsumableArray(array4.slice(moveIndex + 1, length)));
  }
  if (diff < 0) {
    return [].concat(_toConsumableArray(array4.slice(0, moveIndex)), _toConsumableArray(array4.slice(moveIndex + 1, toIndex + 1)), [item], _toConsumableArray(array4.slice(toIndex + 1, length)));
  }
  return array4;
}

// node_modules/rc-field-form/es/Field.js
var _excluded21 = ["name"];
var EMPTY_ERRORS = [];
function requireUpdate(shouldUpdate, prev, next, prevValue, nextValue, info) {
  if (typeof shouldUpdate === "function") {
    return shouldUpdate(prev, next, "source" in info ? {
      source: info.source
    } : {});
  }
  return prevValue !== nextValue;
}
var Field = function(_React$Component) {
  _inherits(Field2, _React$Component);
  var _super = _createSuper(Field2);
  function Field2(props) {
    var _this;
    _classCallCheck(this, Field2);
    _this = _super.call(this, props);
    _defineProperty(_assertThisInitialized(_this), "state", {
      resetCount: 0
    });
    _defineProperty(_assertThisInitialized(_this), "cancelRegisterFunc", null);
    _defineProperty(_assertThisInitialized(_this), "mounted", false);
    _defineProperty(_assertThisInitialized(_this), "touched", false);
    _defineProperty(_assertThisInitialized(_this), "dirty", false);
    _defineProperty(_assertThisInitialized(_this), "validatePromise", void 0);
    _defineProperty(_assertThisInitialized(_this), "prevValidating", void 0);
    _defineProperty(_assertThisInitialized(_this), "errors", EMPTY_ERRORS);
    _defineProperty(_assertThisInitialized(_this), "warnings", EMPTY_ERRORS);
    _defineProperty(_assertThisInitialized(_this), "cancelRegister", function() {
      var _this$props = _this.props, preserve = _this$props.preserve, isListField = _this$props.isListField, name = _this$props.name;
      if (_this.cancelRegisterFunc) {
        _this.cancelRegisterFunc(isListField, preserve, getNamePath(name));
      }
      _this.cancelRegisterFunc = null;
    });
    _defineProperty(_assertThisInitialized(_this), "getNamePath", function() {
      var _this$props2 = _this.props, name = _this$props2.name, fieldContext = _this$props2.fieldContext;
      var _fieldContext$prefixN = fieldContext.prefixName, prefixName = _fieldContext$prefixN === void 0 ? [] : _fieldContext$prefixN;
      return name !== void 0 ? [].concat(_toConsumableArray(prefixName), _toConsumableArray(name)) : [];
    });
    _defineProperty(_assertThisInitialized(_this), "getRules", function() {
      var _this$props3 = _this.props, _this$props3$rules = _this$props3.rules, rules = _this$props3$rules === void 0 ? [] : _this$props3$rules, fieldContext = _this$props3.fieldContext;
      return rules.map(function(rule) {
        if (typeof rule === "function") {
          return rule(fieldContext);
        }
        return rule;
      });
    });
    _defineProperty(_assertThisInitialized(_this), "refresh", function() {
      if (!_this.mounted) return;
      _this.setState(function(_ref) {
        var resetCount = _ref.resetCount;
        return {
          resetCount: resetCount + 1
        };
      });
    });
    _defineProperty(_assertThisInitialized(_this), "metaCache", null);
    _defineProperty(_assertThisInitialized(_this), "triggerMetaEvent", function(destroy) {
      var onMetaChange = _this.props.onMetaChange;
      if (onMetaChange) {
        var _meta = _objectSpread2(_objectSpread2({}, _this.getMeta()), {}, {
          destroy
        });
        if (!isEqual_default(_this.metaCache, _meta)) {
          onMetaChange(_meta);
        }
        _this.metaCache = _meta;
      } else {
        _this.metaCache = null;
      }
    });
    _defineProperty(_assertThisInitialized(_this), "onStoreChange", function(prevStore, namePathList, info) {
      var _this$props4 = _this.props, shouldUpdate = _this$props4.shouldUpdate, _this$props4$dependen = _this$props4.dependencies, dependencies = _this$props4$dependen === void 0 ? [] : _this$props4$dependen, onReset = _this$props4.onReset;
      var store = info.store;
      var namePath = _this.getNamePath();
      var prevValue = _this.getValue(prevStore);
      var curValue = _this.getValue(store);
      var namePathMatch = namePathList && containsNamePath(namePathList, namePath);
      if (info.type === "valueUpdate" && info.source === "external" && !isEqual_default(prevValue, curValue)) {
        _this.touched = true;
        _this.dirty = true;
        _this.validatePromise = null;
        _this.errors = EMPTY_ERRORS;
        _this.warnings = EMPTY_ERRORS;
        _this.triggerMetaEvent();
      }
      switch (info.type) {
        case "reset":
          if (!namePathList || namePathMatch) {
            _this.touched = false;
            _this.dirty = false;
            _this.validatePromise = void 0;
            _this.errors = EMPTY_ERRORS;
            _this.warnings = EMPTY_ERRORS;
            _this.triggerMetaEvent();
            onReset === null || onReset === void 0 || onReset();
            _this.refresh();
            return;
          }
          break;
        case "remove": {
          if (shouldUpdate && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            _this.reRender();
            return;
          }
          break;
        }
        case "setField": {
          var data = info.data;
          if (namePathMatch) {
            if ("touched" in data) {
              _this.touched = data.touched;
            }
            if ("validating" in data && !("originRCField" in data)) {
              _this.validatePromise = data.validating ? Promise.resolve([]) : null;
            }
            if ("errors" in data) {
              _this.errors = data.errors || EMPTY_ERRORS;
            }
            if ("warnings" in data) {
              _this.warnings = data.warnings || EMPTY_ERRORS;
            }
            _this.dirty = true;
            _this.triggerMetaEvent();
            _this.reRender();
            return;
          } else if ("value" in data && containsNamePath(namePathList, namePath, true)) {
            _this.reRender();
            return;
          }
          if (shouldUpdate && !namePath.length && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            _this.reRender();
            return;
          }
          break;
        }
        case "dependenciesUpdate": {
          var dependencyList = dependencies.map(getNamePath);
          if (dependencyList.some(function(dependency) {
            return containsNamePath(info.relatedFields, dependency);
          })) {
            _this.reRender();
            return;
          }
          break;
        }
        default:
          if (namePathMatch || (!dependencies.length || namePath.length || shouldUpdate) && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            _this.reRender();
            return;
          }
          break;
      }
      if (shouldUpdate === true) {
        _this.reRender();
      }
    });
    _defineProperty(_assertThisInitialized(_this), "validateRules", function(options) {
      var namePath = _this.getNamePath();
      var currentValue = _this.getValue();
      var _ref2 = options || {}, triggerName = _ref2.triggerName, _ref2$validateOnly = _ref2.validateOnly, validateOnly = _ref2$validateOnly === void 0 ? false : _ref2$validateOnly;
      var rootPromise = Promise.resolve().then(_asyncToGenerator(_regeneratorRuntime().mark(function _callee() {
        var _this$props5, _this$props5$validate, validateFirst, messageVariables, validateDebounce, filteredRules, promise;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (_this.mounted) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", []);
            case 2:
              _this$props5 = _this.props, _this$props5$validate = _this$props5.validateFirst, validateFirst = _this$props5$validate === void 0 ? false : _this$props5$validate, messageVariables = _this$props5.messageVariables, validateDebounce = _this$props5.validateDebounce;
              filteredRules = _this.getRules();
              if (triggerName) {
                filteredRules = filteredRules.filter(function(rule) {
                  return rule;
                }).filter(function(rule) {
                  var validateTrigger = rule.validateTrigger;
                  if (!validateTrigger) {
                    return true;
                  }
                  var triggerList = toArray3(validateTrigger);
                  return triggerList.includes(triggerName);
                });
              }
              if (!(validateDebounce && triggerName)) {
                _context.next = 10;
                break;
              }
              _context.next = 8;
              return new Promise(function(resolve) {
                setTimeout(resolve, validateDebounce);
              });
            case 8:
              if (!(_this.validatePromise !== rootPromise)) {
                _context.next = 10;
                break;
              }
              return _context.abrupt("return", []);
            case 10:
              promise = validateRules(namePath, currentValue, filteredRules, options, validateFirst, messageVariables);
              promise.catch(function(e) {
                return e;
              }).then(function() {
                var ruleErrors = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : EMPTY_ERRORS;
                if (_this.validatePromise === rootPromise) {
                  var _ruleErrors$forEach;
                  _this.validatePromise = null;
                  var nextErrors = [];
                  var nextWarnings = [];
                  (_ruleErrors$forEach = ruleErrors.forEach) === null || _ruleErrors$forEach === void 0 || _ruleErrors$forEach.call(ruleErrors, function(_ref4) {
                    var warningOnly = _ref4.rule.warningOnly, _ref4$errors = _ref4.errors, errors = _ref4$errors === void 0 ? EMPTY_ERRORS : _ref4$errors;
                    if (warningOnly) {
                      nextWarnings.push.apply(nextWarnings, _toConsumableArray(errors));
                    } else {
                      nextErrors.push.apply(nextErrors, _toConsumableArray(errors));
                    }
                  });
                  _this.errors = nextErrors;
                  _this.warnings = nextWarnings;
                  _this.triggerMetaEvent();
                  _this.reRender();
                }
              });
              return _context.abrupt("return", promise);
            case 13:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })));
      if (validateOnly) {
        return rootPromise;
      }
      _this.validatePromise = rootPromise;
      _this.dirty = true;
      _this.errors = EMPTY_ERRORS;
      _this.warnings = EMPTY_ERRORS;
      _this.triggerMetaEvent();
      _this.reRender();
      return rootPromise;
    });
    _defineProperty(_assertThisInitialized(_this), "isFieldValidating", function() {
      return !!_this.validatePromise;
    });
    _defineProperty(_assertThisInitialized(_this), "isFieldTouched", function() {
      return _this.touched;
    });
    _defineProperty(_assertThisInitialized(_this), "isFieldDirty", function() {
      if (_this.dirty || _this.props.initialValue !== void 0) {
        return true;
      }
      var fieldContext = _this.props.fieldContext;
      var _fieldContext$getInte = fieldContext.getInternalHooks(HOOK_MARK), getInitialValue = _fieldContext$getInte.getInitialValue;
      if (getInitialValue(_this.getNamePath()) !== void 0) {
        return true;
      }
      return false;
    });
    _defineProperty(_assertThisInitialized(_this), "getErrors", function() {
      return _this.errors;
    });
    _defineProperty(_assertThisInitialized(_this), "getWarnings", function() {
      return _this.warnings;
    });
    _defineProperty(_assertThisInitialized(_this), "isListField", function() {
      return _this.props.isListField;
    });
    _defineProperty(_assertThisInitialized(_this), "isList", function() {
      return _this.props.isList;
    });
    _defineProperty(_assertThisInitialized(_this), "isPreserve", function() {
      return _this.props.preserve;
    });
    _defineProperty(_assertThisInitialized(_this), "getMeta", function() {
      _this.prevValidating = _this.isFieldValidating();
      var meta = {
        touched: _this.isFieldTouched(),
        validating: _this.prevValidating,
        errors: _this.errors,
        warnings: _this.warnings,
        name: _this.getNamePath(),
        validated: _this.validatePromise === null
      };
      return meta;
    });
    _defineProperty(_assertThisInitialized(_this), "getOnlyChild", function(children) {
      if (typeof children === "function") {
        var _meta2 = _this.getMeta();
        return _objectSpread2(_objectSpread2({}, _this.getOnlyChild(children(_this.getControlled(), _meta2, _this.props.fieldContext))), {}, {
          isFunction: true
        });
      }
      var childList = toArray(children);
      if (childList.length !== 1 || !React100.isValidElement(childList[0])) {
        return {
          child: childList,
          isFunction: false
        };
      }
      return {
        child: childList[0],
        isFunction: false
      };
    });
    _defineProperty(_assertThisInitialized(_this), "getValue", function(store) {
      var getFieldsValue = _this.props.fieldContext.getFieldsValue;
      var namePath = _this.getNamePath();
      return get(store || getFieldsValue(true), namePath);
    });
    _defineProperty(_assertThisInitialized(_this), "getControlled", function() {
      var childProps = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var _this$props6 = _this.props, name = _this$props6.name, trigger = _this$props6.trigger, validateTrigger = _this$props6.validateTrigger, getValueFromEvent = _this$props6.getValueFromEvent, normalize2 = _this$props6.normalize, valuePropName = _this$props6.valuePropName, getValueProps = _this$props6.getValueProps, fieldContext = _this$props6.fieldContext;
      var mergedValidateTrigger = validateTrigger !== void 0 ? validateTrigger : fieldContext.validateTrigger;
      var namePath = _this.getNamePath();
      var getInternalHooks3 = fieldContext.getInternalHooks, getFieldsValue = fieldContext.getFieldsValue;
      var _getInternalHooks = getInternalHooks3(HOOK_MARK), dispatch = _getInternalHooks.dispatch;
      var value = _this.getValue();
      var mergedGetValueProps = getValueProps || function(val) {
        return _defineProperty({}, valuePropName, val);
      };
      var originTriggerFunc = childProps[trigger];
      var valueProps = name !== void 0 ? mergedGetValueProps(value) : {};
      if (valueProps) {
        Object.keys(valueProps).forEach(function(key) {
          warning_default(typeof valueProps[key] !== "function", "It's not recommended to generate dynamic function prop by `getValueProps`. Please pass it to child component directly (prop: ".concat(key, ")"));
        });
      }
      var control = _objectSpread2(_objectSpread2({}, childProps), valueProps);
      control[trigger] = function() {
        _this.touched = true;
        _this.dirty = true;
        _this.triggerMetaEvent();
        var newValue;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (getValueFromEvent) {
          newValue = getValueFromEvent.apply(void 0, args);
        } else {
          newValue = defaultGetValueFromEvent.apply(void 0, [valuePropName].concat(args));
        }
        if (normalize2) {
          newValue = normalize2(newValue, value, getFieldsValue(true));
        }
        if (newValue !== value) {
          dispatch({
            type: "updateValue",
            namePath,
            value: newValue
          });
        }
        if (originTriggerFunc) {
          originTriggerFunc.apply(void 0, args);
        }
      };
      var validateTriggerList = toArray3(mergedValidateTrigger || []);
      validateTriggerList.forEach(function(triggerName) {
        var originTrigger = control[triggerName];
        control[triggerName] = function() {
          if (originTrigger) {
            originTrigger.apply(void 0, arguments);
          }
          var rules = _this.props.rules;
          if (rules && rules.length) {
            dispatch({
              type: "validateField",
              namePath,
              triggerName
            });
          }
        };
      });
      return control;
    });
    if (props.fieldContext) {
      var getInternalHooks2 = props.fieldContext.getInternalHooks;
      var _getInternalHooks2 = getInternalHooks2(HOOK_MARK), initEntityValue = _getInternalHooks2.initEntityValue;
      initEntityValue(_assertThisInitialized(_this));
    }
    return _this;
  }
  _createClass(Field2, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props7 = this.props, shouldUpdate = _this$props7.shouldUpdate, fieldContext = _this$props7.fieldContext;
      this.mounted = true;
      if (fieldContext) {
        var getInternalHooks2 = fieldContext.getInternalHooks;
        var _getInternalHooks3 = getInternalHooks2(HOOK_MARK), registerField = _getInternalHooks3.registerField;
        this.cancelRegisterFunc = registerField(this);
      }
      if (shouldUpdate === true) {
        this.reRender();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.cancelRegister();
      this.triggerMetaEvent(true);
      this.mounted = false;
    }
  }, {
    key: "reRender",
    value: function reRender() {
      if (!this.mounted) return;
      this.forceUpdate();
    }
  }, {
    key: "render",
    value: function render() {
      var resetCount = this.state.resetCount;
      var children = this.props.children;
      var _this$getOnlyChild = this.getOnlyChild(children), child = _this$getOnlyChild.child, isFunction = _this$getOnlyChild.isFunction;
      var returnChildNode;
      if (isFunction) {
        returnChildNode = child;
      } else if (React100.isValidElement(child)) {
        returnChildNode = React100.cloneElement(child, this.getControlled(child.props));
      } else {
        warning_default(!child, "`children` of Field is not validate ReactElement.");
        returnChildNode = child;
      }
      return React100.createElement(React100.Fragment, {
        key: resetCount
      }, returnChildNode);
    }
  }]);
  return Field2;
}(React100.Component);
_defineProperty(Field, "contextType", FieldContext_default);
_defineProperty(Field, "defaultProps", {
  trigger: "onChange",
  valuePropName: "value"
});
function WrapperField(_ref6) {
  var _restProps$isListFiel;
  var name = _ref6.name, restProps = _objectWithoutProperties(_ref6, _excluded21);
  var fieldContext = React100.useContext(FieldContext_default);
  var listContext = React100.useContext(ListContext_default);
  var namePath = name !== void 0 ? getNamePath(name) : void 0;
  var isMergedListField = (_restProps$isListFiel = restProps.isListField) !== null && _restProps$isListFiel !== void 0 ? _restProps$isListFiel : !!listContext;
  var key = "keep";
  if (!isMergedListField) {
    key = "_".concat((namePath || []).join("_"));
  }
  if (restProps.preserve === false && isMergedListField && namePath.length <= 1) {
    warning_default(false, "`preserve` should not apply on Form.List fields.");
  }
  return React100.createElement(Field, _extends({
    key,
    name: namePath,
    isListField: isMergedListField
  }, restProps, {
    fieldContext
  }));
}
var Field_default = WrapperField;

// node_modules/rc-field-form/es/List.js
var React101 = __toESM(require_react());
function List(_ref) {
  var name = _ref.name, initialValue = _ref.initialValue, children = _ref.children, rules = _ref.rules, validateTrigger = _ref.validateTrigger, isListField = _ref.isListField;
  var context = React101.useContext(FieldContext_default);
  var wrapperListContext = React101.useContext(ListContext_default);
  var keyRef = React101.useRef({
    keys: [],
    id: 0
  });
  var keyManager = keyRef.current;
  var prefixName = React101.useMemo(function() {
    var parentPrefixName = getNamePath(context.prefixName) || [];
    return [].concat(_toConsumableArray(parentPrefixName), _toConsumableArray(getNamePath(name)));
  }, [context.prefixName, name]);
  var fieldContext = React101.useMemo(function() {
    return _objectSpread2(_objectSpread2({}, context), {}, {
      prefixName
    });
  }, [context, prefixName]);
  var listContext = React101.useMemo(function() {
    return {
      getKey: function getKey(namePath) {
        var len = prefixName.length;
        var pathName = namePath[len];
        return [keyManager.keys[pathName], namePath.slice(len + 1)];
      }
    };
  }, [prefixName]);
  if (typeof children !== "function") {
    warning_default(false, "Form.List only accepts function as children.");
    return null;
  }
  var shouldUpdate = function shouldUpdate2(prevValue, nextValue, _ref2) {
    var source = _ref2.source;
    if (source === "internal") {
      return false;
    }
    return prevValue !== nextValue;
  };
  return React101.createElement(ListContext_default.Provider, {
    value: listContext
  }, React101.createElement(FieldContext_default.Provider, {
    value: fieldContext
  }, React101.createElement(Field_default, {
    name: [],
    shouldUpdate,
    rules,
    validateTrigger,
    initialValue,
    isList: true,
    isListField: isListField !== null && isListField !== void 0 ? isListField : !!wrapperListContext
  }, function(_ref3, meta) {
    var _ref3$value = _ref3.value, value = _ref3$value === void 0 ? [] : _ref3$value, onChange = _ref3.onChange;
    var getFieldValue = context.getFieldValue;
    var getNewValue = function getNewValue2() {
      var values = getFieldValue(prefixName || []);
      return values || [];
    };
    var operations = {
      add: function add(defaultValue, index2) {
        var newValue = getNewValue();
        if (index2 >= 0 && index2 <= newValue.length) {
          keyManager.keys = [].concat(_toConsumableArray(keyManager.keys.slice(0, index2)), [keyManager.id], _toConsumableArray(keyManager.keys.slice(index2)));
          onChange([].concat(_toConsumableArray(newValue.slice(0, index2)), [defaultValue], _toConsumableArray(newValue.slice(index2))));
        } else {
          if (index2 < 0 || index2 > newValue.length) {
            warning_default(false, "The second parameter of the add function should be a valid positive number.");
          }
          keyManager.keys = [].concat(_toConsumableArray(keyManager.keys), [keyManager.id]);
          onChange([].concat(_toConsumableArray(newValue), [defaultValue]));
        }
        keyManager.id += 1;
      },
      remove: function remove(index2) {
        var newValue = getNewValue();
        var indexSet = new Set(Array.isArray(index2) ? index2 : [index2]);
        if (indexSet.size <= 0) {
          return;
        }
        keyManager.keys = keyManager.keys.filter(function(_, keysIndex) {
          return !indexSet.has(keysIndex);
        });
        onChange(newValue.filter(function(_, valueIndex) {
          return !indexSet.has(valueIndex);
        }));
      },
      move: function move2(from, to) {
        if (from === to) {
          return;
        }
        var newValue = getNewValue();
        if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
          return;
        }
        keyManager.keys = move(keyManager.keys, from, to);
        onChange(move(newValue, from, to));
      }
    };
    var listValue = value || [];
    if (!Array.isArray(listValue)) {
      listValue = [];
      if (true) {
        warning_default(false, "Current value of '".concat(prefixName.join(" > "), "' is not an array type."));
      }
    }
    return children(listValue.map(function(__, index2) {
      var key = keyManager.keys[index2];
      if (key === void 0) {
        keyManager.keys[index2] = keyManager.id;
        key = keyManager.keys[index2];
        keyManager.id += 1;
      }
      return {
        name: index2,
        key,
        isListField: true
      };
    }), operations, meta);
  })));
}
var List_default = List;

// node_modules/rc-field-form/es/useForm.js
var React102 = __toESM(require_react());

// node_modules/rc-field-form/es/utils/asyncUtil.js
function allPromiseFinish(promiseList) {
  var hasError = false;
  var count = promiseList.length;
  var results = [];
  if (!promiseList.length) {
    return Promise.resolve([]);
  }
  return new Promise(function(resolve, reject) {
    promiseList.forEach(function(promise, index2) {
      promise.catch(function(e) {
        hasError = true;
        return e;
      }).then(function(result) {
        count -= 1;
        results[index2] = result;
        if (count > 0) {
          return;
        }
        if (hasError) {
          reject(results);
        }
        resolve(results);
      });
    });
  });
}

// node_modules/rc-field-form/es/utils/NameMap.js
var SPLIT = "__@field_split__";
function normalize(namePath) {
  return namePath.map(function(cell) {
    return "".concat(_typeof(cell), ":").concat(cell);
  }).join(SPLIT);
}
var NameMap = function() {
  function NameMap2() {
    _classCallCheck(this, NameMap2);
    _defineProperty(this, "kvs", /* @__PURE__ */ new Map());
  }
  _createClass(NameMap2, [{
    key: "set",
    value: function set2(key, value) {
      this.kvs.set(normalize(key), value);
    }
  }, {
    key: "get",
    value: function get2(key) {
      return this.kvs.get(normalize(key));
    }
  }, {
    key: "update",
    value: function update(key, updater) {
      var origin = this.get(key);
      var next = updater(origin);
      if (!next) {
        this.delete(key);
      } else {
        this.set(key, next);
      }
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      this.kvs.delete(normalize(key));
    }
    // Since we only use this in test, let simply realize this
  }, {
    key: "map",
    value: function map(callback) {
      return _toConsumableArray(this.kvs.entries()).map(function(_ref) {
        var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], value = _ref2[1];
        var cells = key.split(SPLIT);
        return callback({
          key: cells.map(function(cell) {
            var _cell$match = cell.match(/^([^:]*):(.*)$/), _cell$match2 = _slicedToArray(_cell$match, 3), type5 = _cell$match2[1], unit2 = _cell$match2[2];
            return type5 === "number" ? Number(unit2) : unit2;
          }),
          value
        });
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var json = {};
      this.map(function(_ref3) {
        var key = _ref3.key, value = _ref3.value;
        json[key.join(".")] = value;
        return null;
      });
      return json;
    }
  }]);
  return NameMap2;
}();
var NameMap_default = NameMap;

// node_modules/rc-field-form/es/useForm.js
var _excluded27 = ["name"];
var FormStore = _createClass(function FormStore2(forceRootUpdate) {
  var _this = this;
  _classCallCheck(this, FormStore2);
  _defineProperty(this, "formHooked", false);
  _defineProperty(this, "forceRootUpdate", void 0);
  _defineProperty(this, "subscribable", true);
  _defineProperty(this, "store", {});
  _defineProperty(this, "fieldEntities", []);
  _defineProperty(this, "initialValues", {});
  _defineProperty(this, "callbacks", {});
  _defineProperty(this, "validateMessages", null);
  _defineProperty(this, "preserve", null);
  _defineProperty(this, "lastValidatePromise", null);
  _defineProperty(this, "getForm", function() {
    return {
      getFieldValue: _this.getFieldValue,
      getFieldsValue: _this.getFieldsValue,
      getFieldError: _this.getFieldError,
      getFieldWarning: _this.getFieldWarning,
      getFieldsError: _this.getFieldsError,
      isFieldsTouched: _this.isFieldsTouched,
      isFieldTouched: _this.isFieldTouched,
      isFieldValidating: _this.isFieldValidating,
      isFieldsValidating: _this.isFieldsValidating,
      resetFields: _this.resetFields,
      setFields: _this.setFields,
      setFieldValue: _this.setFieldValue,
      setFieldsValue: _this.setFieldsValue,
      validateFields: _this.validateFields,
      submit: _this.submit,
      _init: true,
      getInternalHooks: _this.getInternalHooks
    };
  });
  _defineProperty(this, "getInternalHooks", function(key) {
    if (key === HOOK_MARK) {
      _this.formHooked = true;
      return {
        dispatch: _this.dispatch,
        initEntityValue: _this.initEntityValue,
        registerField: _this.registerField,
        useSubscribe: _this.useSubscribe,
        setInitialValues: _this.setInitialValues,
        destroyForm: _this.destroyForm,
        setCallbacks: _this.setCallbacks,
        setValidateMessages: _this.setValidateMessages,
        getFields: _this.getFields,
        setPreserve: _this.setPreserve,
        getInitialValue: _this.getInitialValue,
        registerWatch: _this.registerWatch
      };
    }
    warning_default(false, "`getInternalHooks` is internal usage. Should not call directly.");
    return null;
  });
  _defineProperty(this, "useSubscribe", function(subscribable) {
    _this.subscribable = subscribable;
  });
  _defineProperty(this, "prevWithoutPreserves", null);
  _defineProperty(this, "setInitialValues", function(initialValues, init) {
    _this.initialValues = initialValues || {};
    if (init) {
      var _this$prevWithoutPres;
      var nextStore = merge(initialValues, _this.store);
      (_this$prevWithoutPres = _this.prevWithoutPreserves) === null || _this$prevWithoutPres === void 0 || _this$prevWithoutPres.map(function(_ref) {
        var namePath = _ref.key;
        nextStore = set(nextStore, namePath, get(initialValues, namePath));
      });
      _this.prevWithoutPreserves = null;
      _this.updateStore(nextStore);
    }
  });
  _defineProperty(this, "destroyForm", function(clearOnDestroy) {
    if (clearOnDestroy) {
      _this.updateStore({});
    } else {
      var prevWithoutPreserves = new NameMap_default();
      _this.getFieldEntities(true).forEach(function(entity) {
        if (!_this.isMergedPreserve(entity.isPreserve())) {
          prevWithoutPreserves.set(entity.getNamePath(), true);
        }
      });
      _this.prevWithoutPreserves = prevWithoutPreserves;
    }
  });
  _defineProperty(this, "getInitialValue", function(namePath) {
    var initValue = get(_this.initialValues, namePath);
    return namePath.length ? merge(initValue) : initValue;
  });
  _defineProperty(this, "setCallbacks", function(callbacks) {
    _this.callbacks = callbacks;
  });
  _defineProperty(this, "setValidateMessages", function(validateMessages) {
    _this.validateMessages = validateMessages;
  });
  _defineProperty(this, "setPreserve", function(preserve) {
    _this.preserve = preserve;
  });
  _defineProperty(this, "watchList", []);
  _defineProperty(this, "registerWatch", function(callback) {
    _this.watchList.push(callback);
    return function() {
      _this.watchList = _this.watchList.filter(function(fn) {
        return fn !== callback;
      });
    };
  });
  _defineProperty(this, "notifyWatch", function() {
    var namePath = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    if (_this.watchList.length) {
      var values = _this.getFieldsValue();
      var allValues = _this.getFieldsValue(true);
      _this.watchList.forEach(function(callback) {
        callback(values, allValues, namePath);
      });
    }
  });
  _defineProperty(this, "timeoutId", null);
  _defineProperty(this, "warningUnhooked", function() {
    if (!_this.timeoutId && typeof window !== "undefined") {
      _this.timeoutId = setTimeout(function() {
        _this.timeoutId = null;
        if (!_this.formHooked) {
          warning_default(false, "Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?");
        }
      });
    }
  });
  _defineProperty(this, "updateStore", function(nextStore) {
    _this.store = nextStore;
  });
  _defineProperty(this, "getFieldEntities", function() {
    var pure = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    if (!pure) {
      return _this.fieldEntities;
    }
    return _this.fieldEntities.filter(function(field) {
      return field.getNamePath().length;
    });
  });
  _defineProperty(this, "getFieldsMap", function() {
    var pure = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    var cache = new NameMap_default();
    _this.getFieldEntities(pure).forEach(function(field) {
      var namePath = field.getNamePath();
      cache.set(namePath, field);
    });
    return cache;
  });
  _defineProperty(this, "getFieldEntitiesForNamePathList", function(nameList) {
    if (!nameList) {
      return _this.getFieldEntities(true);
    }
    var cache = _this.getFieldsMap(true);
    return nameList.map(function(name) {
      var namePath = getNamePath(name);
      return cache.get(namePath) || {
        INVALIDATE_NAME_PATH: getNamePath(name)
      };
    });
  });
  _defineProperty(this, "getFieldsValue", function(nameList, filterFunc) {
    _this.warningUnhooked();
    var mergedNameList;
    var mergedFilterFunc;
    var mergedStrict;
    if (nameList === true || Array.isArray(nameList)) {
      mergedNameList = nameList;
      mergedFilterFunc = filterFunc;
    } else if (nameList && _typeof(nameList) === "object") {
      mergedStrict = nameList.strict;
      mergedFilterFunc = nameList.filter;
    }
    if (mergedNameList === true && !mergedFilterFunc) {
      return _this.store;
    }
    var fieldEntities = _this.getFieldEntitiesForNamePathList(Array.isArray(mergedNameList) ? mergedNameList : null);
    var filteredNameList = [];
    fieldEntities.forEach(function(entity) {
      var _isListField, _ref3;
      var namePath = "INVALIDATE_NAME_PATH" in entity ? entity.INVALIDATE_NAME_PATH : entity.getNamePath();
      if (mergedStrict) {
        var _isList, _ref2;
        if ((_isList = (_ref2 = entity).isList) !== null && _isList !== void 0 && _isList.call(_ref2)) {
          return;
        }
      } else if (!mergedNameList && (_isListField = (_ref3 = entity).isListField) !== null && _isListField !== void 0 && _isListField.call(_ref3)) {
        return;
      }
      if (!mergedFilterFunc) {
        filteredNameList.push(namePath);
      } else {
        var meta = "getMeta" in entity ? entity.getMeta() : null;
        if (mergedFilterFunc(meta)) {
          filteredNameList.push(namePath);
        }
      }
    });
    return cloneByNamePathList(_this.store, filteredNameList.map(getNamePath));
  });
  _defineProperty(this, "getFieldValue", function(name) {
    _this.warningUnhooked();
    var namePath = getNamePath(name);
    return get(_this.store, namePath);
  });
  _defineProperty(this, "getFieldsError", function(nameList) {
    _this.warningUnhooked();
    var fieldEntities = _this.getFieldEntitiesForNamePathList(nameList);
    return fieldEntities.map(function(entity, index2) {
      if (entity && !("INVALIDATE_NAME_PATH" in entity)) {
        return {
          name: entity.getNamePath(),
          errors: entity.getErrors(),
          warnings: entity.getWarnings()
        };
      }
      return {
        name: getNamePath(nameList[index2]),
        errors: [],
        warnings: []
      };
    });
  });
  _defineProperty(this, "getFieldError", function(name) {
    _this.warningUnhooked();
    var namePath = getNamePath(name);
    var fieldError = _this.getFieldsError([namePath])[0];
    return fieldError.errors;
  });
  _defineProperty(this, "getFieldWarning", function(name) {
    _this.warningUnhooked();
    var namePath = getNamePath(name);
    var fieldError = _this.getFieldsError([namePath])[0];
    return fieldError.warnings;
  });
  _defineProperty(this, "isFieldsTouched", function() {
    _this.warningUnhooked();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var arg0 = args[0], arg1 = args[1];
    var namePathList;
    var isAllFieldsTouched = false;
    if (args.length === 0) {
      namePathList = null;
    } else if (args.length === 1) {
      if (Array.isArray(arg0)) {
        namePathList = arg0.map(getNamePath);
        isAllFieldsTouched = false;
      } else {
        namePathList = null;
        isAllFieldsTouched = arg0;
      }
    } else {
      namePathList = arg0.map(getNamePath);
      isAllFieldsTouched = arg1;
    }
    var fieldEntities = _this.getFieldEntities(true);
    var isFieldTouched = function isFieldTouched2(field) {
      return field.isFieldTouched();
    };
    if (!namePathList) {
      return isAllFieldsTouched ? fieldEntities.every(function(entity) {
        return isFieldTouched(entity) || entity.isList();
      }) : fieldEntities.some(isFieldTouched);
    }
    var map = new NameMap_default();
    namePathList.forEach(function(shortNamePath) {
      map.set(shortNamePath, []);
    });
    fieldEntities.forEach(function(field) {
      var fieldNamePath = field.getNamePath();
      namePathList.forEach(function(shortNamePath) {
        if (shortNamePath.every(function(nameUnit, i) {
          return fieldNamePath[i] === nameUnit;
        })) {
          map.update(shortNamePath, function(list) {
            return [].concat(_toConsumableArray(list), [field]);
          });
        }
      });
    });
    var isNamePathListTouched = function isNamePathListTouched2(entities) {
      return entities.some(isFieldTouched);
    };
    var namePathListEntities = map.map(function(_ref4) {
      var value = _ref4.value;
      return value;
    });
    return isAllFieldsTouched ? namePathListEntities.every(isNamePathListTouched) : namePathListEntities.some(isNamePathListTouched);
  });
  _defineProperty(this, "isFieldTouched", function(name) {
    _this.warningUnhooked();
    return _this.isFieldsTouched([name]);
  });
  _defineProperty(this, "isFieldsValidating", function(nameList) {
    _this.warningUnhooked();
    var fieldEntities = _this.getFieldEntities();
    if (!nameList) {
      return fieldEntities.some(function(testField) {
        return testField.isFieldValidating();
      });
    }
    var namePathList = nameList.map(getNamePath);
    return fieldEntities.some(function(testField) {
      var fieldNamePath = testField.getNamePath();
      return containsNamePath(namePathList, fieldNamePath) && testField.isFieldValidating();
    });
  });
  _defineProperty(this, "isFieldValidating", function(name) {
    _this.warningUnhooked();
    return _this.isFieldsValidating([name]);
  });
  _defineProperty(this, "resetWithFieldInitialValue", function() {
    var info = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var cache = new NameMap_default();
    var fieldEntities = _this.getFieldEntities(true);
    fieldEntities.forEach(function(field) {
      var initialValue = field.props.initialValue;
      var namePath = field.getNamePath();
      if (initialValue !== void 0) {
        var records = cache.get(namePath) || /* @__PURE__ */ new Set();
        records.add({
          entity: field,
          value: initialValue
        });
        cache.set(namePath, records);
      }
    });
    var resetWithFields = function resetWithFields2(entities) {
      entities.forEach(function(field) {
        var initialValue = field.props.initialValue;
        if (initialValue !== void 0) {
          var namePath = field.getNamePath();
          var formInitialValue = _this.getInitialValue(namePath);
          if (formInitialValue !== void 0) {
            warning_default(false, "Form already set 'initialValues' with path '".concat(namePath.join("."), "'. Field can not overwrite it."));
          } else {
            var records = cache.get(namePath);
            if (records && records.size > 1) {
              warning_default(false, "Multiple Field with path '".concat(namePath.join("."), "' set 'initialValue'. Can not decide which one to pick."));
            } else if (records) {
              var originValue = _this.getFieldValue(namePath);
              var isListField = field.isListField();
              if (!isListField && (!info.skipExist || originValue === void 0)) {
                _this.updateStore(set(_this.store, namePath, _toConsumableArray(records)[0].value));
              }
            }
          }
        }
      });
    };
    var requiredFieldEntities;
    if (info.entities) {
      requiredFieldEntities = info.entities;
    } else if (info.namePathList) {
      requiredFieldEntities = [];
      info.namePathList.forEach(function(namePath) {
        var records = cache.get(namePath);
        if (records) {
          var _requiredFieldEntitie;
          (_requiredFieldEntitie = requiredFieldEntities).push.apply(_requiredFieldEntitie, _toConsumableArray(_toConsumableArray(records).map(function(r) {
            return r.entity;
          })));
        }
      });
    } else {
      requiredFieldEntities = fieldEntities;
    }
    resetWithFields(requiredFieldEntities);
  });
  _defineProperty(this, "resetFields", function(nameList) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    if (!nameList) {
      _this.updateStore(merge(_this.initialValues));
      _this.resetWithFieldInitialValue();
      _this.notifyObservers(prevStore, null, {
        type: "reset"
      });
      _this.notifyWatch();
      return;
    }
    var namePathList = nameList.map(getNamePath);
    namePathList.forEach(function(namePath) {
      var initialValue = _this.getInitialValue(namePath);
      _this.updateStore(set(_this.store, namePath, initialValue));
    });
    _this.resetWithFieldInitialValue({
      namePathList
    });
    _this.notifyObservers(prevStore, namePathList, {
      type: "reset"
    });
    _this.notifyWatch(namePathList);
  });
  _defineProperty(this, "setFields", function(fields) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    var namePathList = [];
    fields.forEach(function(fieldData) {
      var name = fieldData.name, data = _objectWithoutProperties(fieldData, _excluded27);
      var namePath = getNamePath(name);
      namePathList.push(namePath);
      if ("value" in data) {
        _this.updateStore(set(_this.store, namePath, data.value));
      }
      _this.notifyObservers(prevStore, [namePath], {
        type: "setField",
        data: fieldData
      });
    });
    _this.notifyWatch(namePathList);
  });
  _defineProperty(this, "getFields", function() {
    var entities = _this.getFieldEntities(true);
    var fields = entities.map(function(field) {
      var namePath = field.getNamePath();
      var meta = field.getMeta();
      var fieldData = _objectSpread2(_objectSpread2({}, meta), {}, {
        name: namePath,
        value: _this.getFieldValue(namePath)
      });
      Object.defineProperty(fieldData, "originRCField", {
        value: true
      });
      return fieldData;
    });
    return fields;
  });
  _defineProperty(this, "initEntityValue", function(entity) {
    var initialValue = entity.props.initialValue;
    if (initialValue !== void 0) {
      var namePath = entity.getNamePath();
      var prevValue = get(_this.store, namePath);
      if (prevValue === void 0) {
        _this.updateStore(set(_this.store, namePath, initialValue));
      }
    }
  });
  _defineProperty(this, "isMergedPreserve", function(fieldPreserve) {
    var mergedPreserve = fieldPreserve !== void 0 ? fieldPreserve : _this.preserve;
    return mergedPreserve !== null && mergedPreserve !== void 0 ? mergedPreserve : true;
  });
  _defineProperty(this, "registerField", function(entity) {
    _this.fieldEntities.push(entity);
    var namePath = entity.getNamePath();
    _this.notifyWatch([namePath]);
    if (entity.props.initialValue !== void 0) {
      var prevStore = _this.store;
      _this.resetWithFieldInitialValue({
        entities: [entity],
        skipExist: true
      });
      _this.notifyObservers(prevStore, [entity.getNamePath()], {
        type: "valueUpdate",
        source: "internal"
      });
    }
    return function(isListField, preserve) {
      var subNamePath = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
      _this.fieldEntities = _this.fieldEntities.filter(function(item) {
        return item !== entity;
      });
      if (!_this.isMergedPreserve(preserve) && (!isListField || subNamePath.length > 1)) {
        var defaultValue = isListField ? void 0 : _this.getInitialValue(namePath);
        if (namePath.length && _this.getFieldValue(namePath) !== defaultValue && _this.fieldEntities.every(function(field) {
          return (
            // Only reset when no namePath exist
            !matchNamePath(field.getNamePath(), namePath)
          );
        })) {
          var _prevStore = _this.store;
          _this.updateStore(set(_prevStore, namePath, defaultValue, true));
          _this.notifyObservers(_prevStore, [namePath], {
            type: "remove"
          });
          _this.triggerDependenciesUpdate(_prevStore, namePath);
        }
      }
      _this.notifyWatch([namePath]);
    };
  });
  _defineProperty(this, "dispatch", function(action) {
    switch (action.type) {
      case "updateValue": {
        var namePath = action.namePath, value = action.value;
        _this.updateValue(namePath, value);
        break;
      }
      case "validateField": {
        var _namePath = action.namePath, triggerName = action.triggerName;
        _this.validateFields([_namePath], {
          triggerName
        });
        break;
      }
      default:
    }
  });
  _defineProperty(this, "notifyObservers", function(prevStore, namePathList, info) {
    if (_this.subscribable) {
      var mergedInfo = _objectSpread2(_objectSpread2({}, info), {}, {
        store: _this.getFieldsValue(true)
      });
      _this.getFieldEntities().forEach(function(_ref5) {
        var onStoreChange = _ref5.onStoreChange;
        onStoreChange(prevStore, namePathList, mergedInfo);
      });
    } else {
      _this.forceRootUpdate();
    }
  });
  _defineProperty(this, "triggerDependenciesUpdate", function(prevStore, namePath) {
    var childrenFields = _this.getDependencyChildrenFields(namePath);
    if (childrenFields.length) {
      _this.validateFields(childrenFields);
    }
    _this.notifyObservers(prevStore, childrenFields, {
      type: "dependenciesUpdate",
      relatedFields: [namePath].concat(_toConsumableArray(childrenFields))
    });
    return childrenFields;
  });
  _defineProperty(this, "updateValue", function(name, value) {
    var namePath = getNamePath(name);
    var prevStore = _this.store;
    _this.updateStore(set(_this.store, namePath, value));
    _this.notifyObservers(prevStore, [namePath], {
      type: "valueUpdate",
      source: "internal"
    });
    _this.notifyWatch([namePath]);
    var childrenFields = _this.triggerDependenciesUpdate(prevStore, namePath);
    var onValuesChange = _this.callbacks.onValuesChange;
    if (onValuesChange) {
      var changedValues = cloneByNamePathList(_this.store, [namePath]);
      onValuesChange(changedValues, _this.getFieldsValue());
    }
    _this.triggerOnFieldsChange([namePath].concat(_toConsumableArray(childrenFields)));
  });
  _defineProperty(this, "setFieldsValue", function(store) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    if (store) {
      var nextStore = merge(_this.store, store);
      _this.updateStore(nextStore);
    }
    _this.notifyObservers(prevStore, null, {
      type: "valueUpdate",
      source: "external"
    });
    _this.notifyWatch();
  });
  _defineProperty(this, "setFieldValue", function(name, value) {
    _this.setFields([{
      name,
      value,
      errors: [],
      warnings: []
    }]);
  });
  _defineProperty(this, "getDependencyChildrenFields", function(rootNamePath) {
    var children = /* @__PURE__ */ new Set();
    var childrenFields = [];
    var dependencies2fields = new NameMap_default();
    _this.getFieldEntities().forEach(function(field) {
      var dependencies = field.props.dependencies;
      (dependencies || []).forEach(function(dependency) {
        var dependencyNamePath = getNamePath(dependency);
        dependencies2fields.update(dependencyNamePath, function() {
          var fields = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : /* @__PURE__ */ new Set();
          fields.add(field);
          return fields;
        });
      });
    });
    var fillChildren = function fillChildren2(namePath) {
      var fields = dependencies2fields.get(namePath) || /* @__PURE__ */ new Set();
      fields.forEach(function(field) {
        if (!children.has(field)) {
          children.add(field);
          var fieldNamePath = field.getNamePath();
          if (field.isFieldDirty() && fieldNamePath.length) {
            childrenFields.push(fieldNamePath);
            fillChildren2(fieldNamePath);
          }
        }
      });
    };
    fillChildren(rootNamePath);
    return childrenFields;
  });
  _defineProperty(this, "triggerOnFieldsChange", function(namePathList, filedErrors) {
    var onFieldsChange = _this.callbacks.onFieldsChange;
    if (onFieldsChange) {
      var fields = _this.getFields();
      if (filedErrors) {
        var cache = new NameMap_default();
        filedErrors.forEach(function(_ref6) {
          var name = _ref6.name, errors = _ref6.errors;
          cache.set(name, errors);
        });
        fields.forEach(function(field) {
          field.errors = cache.get(field.name) || field.errors;
        });
      }
      var changedFields = fields.filter(function(_ref7) {
        var fieldName = _ref7.name;
        return containsNamePath(namePathList, fieldName);
      });
      if (changedFields.length) {
        onFieldsChange(changedFields, fields);
      }
    }
  });
  _defineProperty(this, "validateFields", function(arg1, arg2) {
    _this.warningUnhooked();
    var nameList;
    var options;
    if (Array.isArray(arg1) || typeof arg1 === "string" || typeof arg2 === "string") {
      nameList = arg1;
      options = arg2;
    } else {
      options = arg1;
    }
    var provideNameList = !!nameList;
    var namePathList = provideNameList ? nameList.map(getNamePath) : [];
    var promiseList = [];
    var TMP_SPLIT = String(Date.now());
    var validateNamePathList = /* @__PURE__ */ new Set();
    var _ref8 = options || {}, recursive = _ref8.recursive, dirty = _ref8.dirty;
    _this.getFieldEntities(true).forEach(function(field) {
      if (!provideNameList) {
        namePathList.push(field.getNamePath());
      }
      if (!field.props.rules || !field.props.rules.length) {
        return;
      }
      if (dirty && !field.isFieldDirty()) {
        return;
      }
      var fieldNamePath = field.getNamePath();
      validateNamePathList.add(fieldNamePath.join(TMP_SPLIT));
      if (!provideNameList || containsNamePath(namePathList, fieldNamePath, recursive)) {
        var promise = field.validateRules(_objectSpread2({
          validateMessages: _objectSpread2(_objectSpread2({}, defaultValidateMessages), _this.validateMessages)
        }, options));
        promiseList.push(promise.then(function() {
          return {
            name: fieldNamePath,
            errors: [],
            warnings: []
          };
        }).catch(function(ruleErrors) {
          var _ruleErrors$forEach;
          var mergedErrors = [];
          var mergedWarnings = [];
          (_ruleErrors$forEach = ruleErrors.forEach) === null || _ruleErrors$forEach === void 0 || _ruleErrors$forEach.call(ruleErrors, function(_ref9) {
            var warningOnly = _ref9.rule.warningOnly, errors = _ref9.errors;
            if (warningOnly) {
              mergedWarnings.push.apply(mergedWarnings, _toConsumableArray(errors));
            } else {
              mergedErrors.push.apply(mergedErrors, _toConsumableArray(errors));
            }
          });
          if (mergedErrors.length) {
            return Promise.reject({
              name: fieldNamePath,
              errors: mergedErrors,
              warnings: mergedWarnings
            });
          }
          return {
            name: fieldNamePath,
            errors: mergedErrors,
            warnings: mergedWarnings
          };
        }));
      }
    });
    var summaryPromise = allPromiseFinish(promiseList);
    _this.lastValidatePromise = summaryPromise;
    summaryPromise.catch(function(results) {
      return results;
    }).then(function(results) {
      var resultNamePathList = results.map(function(_ref10) {
        var name = _ref10.name;
        return name;
      });
      _this.notifyObservers(_this.store, resultNamePathList, {
        type: "validateFinish"
      });
      _this.triggerOnFieldsChange(resultNamePathList, results);
    });
    var returnPromise = summaryPromise.then(function() {
      if (_this.lastValidatePromise === summaryPromise) {
        return Promise.resolve(_this.getFieldsValue(namePathList));
      }
      return Promise.reject([]);
    }).catch(function(results) {
      var errorList = results.filter(function(result) {
        return result && result.errors.length;
      });
      return Promise.reject({
        values: _this.getFieldsValue(namePathList),
        errorFields: errorList,
        outOfDate: _this.lastValidatePromise !== summaryPromise
      });
    });
    returnPromise.catch(function(e) {
      return e;
    });
    var triggerNamePathList = namePathList.filter(function(namePath) {
      return validateNamePathList.has(namePath.join(TMP_SPLIT));
    });
    _this.triggerOnFieldsChange(triggerNamePathList);
    return returnPromise;
  });
  _defineProperty(this, "submit", function() {
    _this.warningUnhooked();
    _this.validateFields().then(function(values) {
      var onFinish = _this.callbacks.onFinish;
      if (onFinish) {
        try {
          onFinish(values);
        } catch (err) {
          console.error(err);
        }
      }
    }).catch(function(e) {
      var onFinishFailed = _this.callbacks.onFinishFailed;
      if (onFinishFailed) {
        onFinishFailed(e);
      }
    });
  });
  this.forceRootUpdate = forceRootUpdate;
});
function useForm(form) {
  var formRef = React102.useRef();
  var _React$useState = React102.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), forceUpdate = _React$useState2[1];
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      var forceReRender = function forceReRender2() {
        forceUpdate({});
      };
      var formStore = new FormStore(forceReRender);
      formRef.current = formStore.getForm();
    }
  }
  return [formRef.current];
}
var useForm_default = useForm;

// node_modules/rc-field-form/es/Form.js
var React104 = __toESM(require_react());

// node_modules/rc-field-form/es/FormContext.js
var React103 = __toESM(require_react());
var FormContext = React103.createContext({
  triggerFormChange: function triggerFormChange() {
  },
  triggerFormFinish: function triggerFormFinish() {
  },
  registerForm: function registerForm() {
  },
  unregisterForm: function unregisterForm() {
  }
});
var FormProvider = function FormProvider2(_ref) {
  var validateMessages = _ref.validateMessages, onFormChange = _ref.onFormChange, onFormFinish = _ref.onFormFinish, children = _ref.children;
  var formContext = React103.useContext(FormContext);
  var formsRef = React103.useRef({});
  return React103.createElement(FormContext.Provider, {
    value: _objectSpread2(_objectSpread2({}, formContext), {}, {
      validateMessages: _objectSpread2(_objectSpread2({}, formContext.validateMessages), validateMessages),
      // =========================================================
      // =                  Global Form Control                  =
      // =========================================================
      triggerFormChange: function triggerFormChange2(name, changedFields) {
        if (onFormChange) {
          onFormChange(name, {
            changedFields,
            forms: formsRef.current
          });
        }
        formContext.triggerFormChange(name, changedFields);
      },
      triggerFormFinish: function triggerFormFinish2(name, values) {
        if (onFormFinish) {
          onFormFinish(name, {
            values,
            forms: formsRef.current
          });
        }
        formContext.triggerFormFinish(name, values);
      },
      registerForm: function registerForm2(name, form) {
        if (name) {
          formsRef.current = _objectSpread2(_objectSpread2({}, formsRef.current), {}, _defineProperty({}, name, form));
        }
        formContext.registerForm(name, form);
      },
      unregisterForm: function unregisterForm2(name) {
        var newForms = _objectSpread2({}, formsRef.current);
        delete newForms[name];
        formsRef.current = newForms;
        formContext.unregisterForm(name);
      }
    })
  }, children);
};
var FormContext_default = FormContext;

// node_modules/rc-field-form/es/Form.js
var _excluded28 = ["name", "initialValues", "fields", "form", "preserve", "children", "component", "validateMessages", "validateTrigger", "onValuesChange", "onFieldsChange", "onFinish", "onFinishFailed", "clearOnDestroy"];
var Form = function Form2(_ref, ref) {
  var name = _ref.name, initialValues = _ref.initialValues, fields = _ref.fields, form = _ref.form, preserve = _ref.preserve, children = _ref.children, _ref$component = _ref.component, Component6 = _ref$component === void 0 ? "form" : _ref$component, validateMessages = _ref.validateMessages, _ref$validateTrigger = _ref.validateTrigger, validateTrigger = _ref$validateTrigger === void 0 ? "onChange" : _ref$validateTrigger, onValuesChange = _ref.onValuesChange, _onFieldsChange = _ref.onFieldsChange, _onFinish = _ref.onFinish, onFinishFailed = _ref.onFinishFailed, clearOnDestroy = _ref.clearOnDestroy, restProps = _objectWithoutProperties(_ref, _excluded28);
  var nativeElementRef = React104.useRef(null);
  var formContext = React104.useContext(FormContext_default);
  var _useForm = useForm_default(form), _useForm2 = _slicedToArray(_useForm, 1), formInstance = _useForm2[0];
  var _getInternalHooks = formInstance.getInternalHooks(HOOK_MARK), useSubscribe = _getInternalHooks.useSubscribe, setInitialValues = _getInternalHooks.setInitialValues, setCallbacks = _getInternalHooks.setCallbacks, setValidateMessages = _getInternalHooks.setValidateMessages, setPreserve = _getInternalHooks.setPreserve, destroyForm = _getInternalHooks.destroyForm;
  React104.useImperativeHandle(ref, function() {
    return _objectSpread2(_objectSpread2({}, formInstance), {}, {
      nativeElement: nativeElementRef.current
    });
  });
  React104.useEffect(function() {
    formContext.registerForm(name, formInstance);
    return function() {
      formContext.unregisterForm(name);
    };
  }, [formContext, formInstance, name]);
  setValidateMessages(_objectSpread2(_objectSpread2({}, formContext.validateMessages), validateMessages));
  setCallbacks({
    onValuesChange,
    onFieldsChange: function onFieldsChange(changedFields) {
      formContext.triggerFormChange(name, changedFields);
      if (_onFieldsChange) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }
        _onFieldsChange.apply(void 0, [changedFields].concat(rest));
      }
    },
    onFinish: function onFinish(values) {
      formContext.triggerFormFinish(name, values);
      if (_onFinish) {
        _onFinish(values);
      }
    },
    onFinishFailed
  });
  setPreserve(preserve);
  var mountRef = React104.useRef(null);
  setInitialValues(initialValues, !mountRef.current);
  if (!mountRef.current) {
    mountRef.current = true;
  }
  React104.useEffect(
    function() {
      return function() {
        return destroyForm(clearOnDestroy);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  var childrenNode;
  var childrenRenderProps = typeof children === "function";
  if (childrenRenderProps) {
    var _values = formInstance.getFieldsValue(true);
    childrenNode = children(_values, formInstance);
  } else {
    childrenNode = children;
  }
  useSubscribe(!childrenRenderProps);
  var prevFieldsRef = React104.useRef();
  React104.useEffect(function() {
    if (!isSimilar(prevFieldsRef.current || [], fields || [])) {
      formInstance.setFields(fields || []);
    }
    prevFieldsRef.current = fields;
  }, [fields, formInstance]);
  var formContextValue = React104.useMemo(function() {
    return _objectSpread2(_objectSpread2({}, formInstance), {}, {
      validateTrigger
    });
  }, [formInstance, validateTrigger]);
  var wrapperNode = React104.createElement(ListContext_default.Provider, {
    value: null
  }, React104.createElement(FieldContext_default.Provider, {
    value: formContextValue
  }, childrenNode));
  if (Component6 === false) {
    return wrapperNode;
  }
  return React104.createElement(Component6, _extends({}, restProps, {
    ref: nativeElementRef,
    onSubmit: function onSubmit(event) {
      event.preventDefault();
      event.stopPropagation();
      formInstance.submit();
    },
    onReset: function onReset(event) {
      var _restProps$onReset;
      event.preventDefault();
      formInstance.resetFields();
      (_restProps$onReset = restProps.onReset) === null || _restProps$onReset === void 0 || _restProps$onReset.call(restProps, event);
    }
  }), wrapperNode);
};
var Form_default = Form;

// node_modules/rc-field-form/es/useWatch.js
var import_react27 = __toESM(require_react());
function stringify2(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    return Math.random();
  }
}
var useWatchWarning = true ? function(namePath) {
  var fullyStr = namePath.join("__RC_FIELD_FORM_SPLIT__");
  var nameStrRef = (0, import_react27.useRef)(fullyStr);
  warning_default(nameStrRef.current === fullyStr, "`useWatch` is not support dynamic `namePath`. Please provide static instead.");
} : function() {
};
function useWatch2() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var dependencies = args[0], _args$ = args[1], _form = _args$ === void 0 ? {} : _args$;
  var options = isFormInstance(_form) ? {
    form: _form
  } : _form;
  var form = options.form;
  var _useState = (0, import_react27.useState)(), _useState2 = _slicedToArray(_useState, 2), value = _useState2[0], setValue = _useState2[1];
  var valueStr = (0, import_react27.useMemo)(function() {
    return stringify2(value);
  }, [value]);
  var valueStrRef = (0, import_react27.useRef)(valueStr);
  valueStrRef.current = valueStr;
  var fieldContext = (0, import_react27.useContext)(FieldContext_default);
  var formInstance = form || fieldContext;
  var isValidForm = formInstance && formInstance._init;
  if (true) {
    warning_default(args.length === 2 ? form ? isValidForm : true : isValidForm, "useWatch requires a form instance since it can not auto detect from context.");
  }
  var namePath = getNamePath(dependencies);
  var namePathRef = (0, import_react27.useRef)(namePath);
  namePathRef.current = namePath;
  useWatchWarning(namePath);
  (0, import_react27.useEffect)(
    function() {
      if (!isValidForm) {
        return;
      }
      var getFieldsValue = formInstance.getFieldsValue, getInternalHooks2 = formInstance.getInternalHooks;
      var _getInternalHooks = getInternalHooks2(HOOK_MARK), registerWatch = _getInternalHooks.registerWatch;
      var getWatchValue = function getWatchValue2(values, allValues) {
        var watchValue = options.preserve ? allValues : values;
        return typeof dependencies === "function" ? dependencies(watchValue) : get(watchValue, namePathRef.current);
      };
      var cancelRegister = registerWatch(function(values, allValues) {
        var newValue = getWatchValue(values, allValues);
        var nextValueStr = stringify2(newValue);
        if (valueStrRef.current !== nextValueStr) {
          valueStrRef.current = nextValueStr;
          setValue(newValue);
        }
      });
      var initialValue = getWatchValue(getFieldsValue(), getFieldsValue(true));
      if (value !== initialValue) {
        setValue(initialValue);
      }
      return cancelRegister;
    },
    // We do not need re-register since namePath content is the same
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isValidForm]
  );
  return value;
}
var useWatch_default = useWatch2;

// node_modules/rc-field-form/es/index.js
var InternalForm = React105.forwardRef(Form_default);
var RefForm = InternalForm;
RefForm.FormProvider = FormProvider;
RefForm.Field = Field_default;
RefForm.List = List_default;
RefForm.useForm = useForm_default;
RefForm.useWatch = useWatch_default;
var es_default10 = RefForm;

// node_modules/antd/es/form/context.js
var FormContext2 = React106.createContext({
  labelAlign: "right",
  vertical: false,
  itemRef: () => {
  }
});
var NoStyleItemContext = React106.createContext(null);
var FormProvider3 = (props) => {
  const providerProps = omit(props, ["prefixCls"]);
  return React106.createElement(FormProvider, Object.assign({}, providerProps));
};
var FormItemPrefixContext = React106.createContext({
  prefixCls: ""
});
var FormItemInputContext = React106.createContext({});
if (true) {
  FormItemInputContext.displayName = "FormItemInputContext";
}
var NoFormStyle = ({
  children,
  status,
  override
}) => {
  const formItemInputContext = React106.useContext(FormItemInputContext);
  const newFormItemInputContext = React106.useMemo(() => {
    const newContext = Object.assign({}, formItemInputContext);
    if (override) {
      delete newContext.isFormItemInput;
    }
    if (status) {
      delete newContext.status;
      delete newContext.hasFeedback;
      delete newContext.feedbackIcon;
    }
    return newContext;
  }, [status, override, formItemInputContext]);
  return React106.createElement(FormItemInputContext.Provider, {
    value: newFormItemInputContext
  }, children);
};
var VariantContext = React106.createContext(void 0);

// node_modules/antd/es/form/hooks/useVariants.js
var useVariant = (component, variant, legacyBordered = void 0) => {
  var _a, _b;
  const {
    variant: configVariant,
    [component]: componentConfig
  } = React107.useContext(ConfigContext);
  const ctxVariant = React107.useContext(VariantContext);
  const configComponentVariant = componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.variant;
  let mergedVariant;
  if (typeof variant !== "undefined") {
    mergedVariant = variant;
  } else if (legacyBordered === false) {
    mergedVariant = "borderless";
  } else {
    mergedVariant = (_b = (_a = ctxVariant !== null && ctxVariant !== void 0 ? ctxVariant : configComponentVariant) !== null && _a !== void 0 ? _a : configVariant) !== null && _b !== void 0 ? _b : "outlined";
  }
  const enableVariantCls = Variants.includes(mergedVariant);
  return [mergedVariant, enableVariantCls];
};
var useVariants_default = useVariant;

// node_modules/antd/es/card/Card.js
var __rest5 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var ActionNode = (props) => {
  const {
    actionClasses,
    actions = [],
    actionStyle
  } = props;
  return React108.createElement("ul", {
    className: actionClasses,
    style: actionStyle
  }, actions.map((action, index2) => {
    const key = `action-${index2}`;
    return React108.createElement("li", {
      style: {
        width: `${100 / actions.length}%`
      },
      key
    }, React108.createElement("span", null, action));
  }));
};
var Card = React108.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style: style2,
    extra,
    headStyle = {},
    bodyStyle = {},
    title,
    loading,
    bordered,
    variant: customVariant,
    size: customizeSize,
    type: type5,
    cover,
    actions,
    tabList,
    children,
    activeTabKey,
    defaultActiveTabKey,
    tabBarExtraContent,
    hoverable,
    tabProps = {},
    classNames: customClassNames,
    styles: customStyles
  } = props, others = __rest5(props, ["prefixCls", "className", "rootClassName", "style", "extra", "headStyle", "bodyStyle", "title", "loading", "bordered", "variant", "size", "type", "cover", "actions", "tabList", "children", "activeTabKey", "defaultActiveTabKey", "tabBarExtraContent", "hoverable", "tabProps", "classNames", "styles"]);
  const {
    getPrefixCls,
    direction,
    card
  } = React108.useContext(ConfigContext);
  const [variant] = useVariants_default("card", customVariant, bordered);
  if (true) {
    const warning5 = devUseWarning("Card");
    [["headStyle", "styles.header"], ["bodyStyle", "styles.body"], ["bordered", "variant"]].forEach(([deprecatedName, newName]) => {
      warning5.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const onTabChange = (key) => {
    var _a;
    (_a = props.onTabChange) === null || _a === void 0 ? void 0 : _a.call(props, key);
  };
  const moduleClass = (moduleName) => {
    var _a;
    return (0, import_classnames35.default)((_a = card === null || card === void 0 ? void 0 : card.classNames) === null || _a === void 0 ? void 0 : _a[moduleName], customClassNames === null || customClassNames === void 0 ? void 0 : customClassNames[moduleName]);
  };
  const moduleStyle = (moduleName) => {
    var _a;
    return Object.assign(Object.assign({}, (_a = card === null || card === void 0 ? void 0 : card.styles) === null || _a === void 0 ? void 0 : _a[moduleName]), customStyles === null || customStyles === void 0 ? void 0 : customStyles[moduleName]);
  };
  const isContainGrid = React108.useMemo(() => {
    let containGrid = false;
    React108.Children.forEach(children, (element) => {
      if ((element === null || element === void 0 ? void 0 : element.type) === Grid_default) {
        containGrid = true;
      }
    });
    return containGrid;
  }, [children]);
  const prefixCls = getPrefixCls("card", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default3(prefixCls);
  const loadingBlock = React108.createElement(skeleton_default, {
    loading: true,
    active: true,
    paragraph: {
      rows: 4
    },
    title: false
  }, children);
  const hasActiveTabKey = activeTabKey !== void 0;
  const extraProps = Object.assign(Object.assign({}, tabProps), {
    [hasActiveTabKey ? "activeKey" : "defaultActiveKey"]: hasActiveTabKey ? activeTabKey : defaultActiveTabKey,
    tabBarExtraContent
  });
  let head;
  const mergedSize = useSize_default(customizeSize);
  const tabSize = !mergedSize || mergedSize === "default" ? "large" : mergedSize;
  const tabs = tabList ? React108.createElement(tabs_default, Object.assign({
    size: tabSize
  }, extraProps, {
    className: `${prefixCls}-head-tabs`,
    onChange: onTabChange,
    items: tabList.map((_a) => {
      var {
        tab
      } = _a, item = __rest5(_a, ["tab"]);
      return Object.assign({
        label: tab
      }, item);
    })
  })) : null;
  if (title || extra || tabs) {
    const headClasses = (0, import_classnames35.default)(`${prefixCls}-head`, moduleClass("header"));
    const titleClasses = (0, import_classnames35.default)(`${prefixCls}-head-title`, moduleClass("title"));
    const extraClasses = (0, import_classnames35.default)(`${prefixCls}-extra`, moduleClass("extra"));
    const mergedHeadStyle = Object.assign(Object.assign({}, headStyle), moduleStyle("header"));
    head = React108.createElement("div", {
      className: headClasses,
      style: mergedHeadStyle
    }, React108.createElement("div", {
      className: `${prefixCls}-head-wrapper`
    }, title && React108.createElement("div", {
      className: titleClasses,
      style: moduleStyle("title")
    }, title), extra && React108.createElement("div", {
      className: extraClasses,
      style: moduleStyle("extra")
    }, extra)), tabs);
  }
  const coverClasses = (0, import_classnames35.default)(`${prefixCls}-cover`, moduleClass("cover"));
  const coverDom = cover ? React108.createElement("div", {
    className: coverClasses,
    style: moduleStyle("cover")
  }, cover) : null;
  const bodyClasses = (0, import_classnames35.default)(`${prefixCls}-body`, moduleClass("body"));
  const mergedBodyStyle = Object.assign(Object.assign({}, bodyStyle), moduleStyle("body"));
  const body = React108.createElement("div", {
    className: bodyClasses,
    style: mergedBodyStyle
  }, loading ? loadingBlock : children);
  const actionClasses = (0, import_classnames35.default)(`${prefixCls}-actions`, moduleClass("actions"));
  const actionDom = (actions === null || actions === void 0 ? void 0 : actions.length) ? React108.createElement(ActionNode, {
    actionClasses,
    actionStyle: moduleStyle("actions"),
    actions
  }) : null;
  const divProps = omit(others, ["onTabChange"]);
  const classString = (0, import_classnames35.default)(prefixCls, card === null || card === void 0 ? void 0 : card.className, {
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-bordered`]: variant !== "borderless",
    [`${prefixCls}-hoverable`]: hoverable,
    [`${prefixCls}-contain-grid`]: isContainGrid,
    [`${prefixCls}-contain-tabs`]: tabList === null || tabList === void 0 ? void 0 : tabList.length,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    [`${prefixCls}-type-${type5}`]: !!type5,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, rootClassName, hashId, cssVarCls);
  const mergedStyle = Object.assign(Object.assign({}, card === null || card === void 0 ? void 0 : card.style), style2);
  return wrapCSSVar(React108.createElement("div", Object.assign({
    ref
  }, divProps, {
    className: classString,
    style: mergedStyle
  }), head, coverDom, body, actionDom));
});
var Card_default = Card;

// node_modules/antd/es/card/Meta.js
var React109 = __toESM(require_react());
var import_classnames36 = __toESM(require_classnames());
var __rest6 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var Meta = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    avatar,
    title,
    description
  } = props, others = __rest6(props, ["prefixCls", "className", "avatar", "title", "description"]);
  const {
    getPrefixCls
  } = React109.useContext(ConfigContext);
  const prefixCls = getPrefixCls("card", customizePrefixCls);
  const classString = (0, import_classnames36.default)(`${prefixCls}-meta`, className);
  const avatarDom = avatar ? React109.createElement("div", {
    className: `${prefixCls}-meta-avatar`
  }, avatar) : null;
  const titleDom = title ? React109.createElement("div", {
    className: `${prefixCls}-meta-title`
  }, title) : null;
  const descriptionDom = description ? React109.createElement("div", {
    className: `${prefixCls}-meta-description`
  }, description) : null;
  const MetaDetail = titleDom || descriptionDom ? React109.createElement("div", {
    className: `${prefixCls}-meta-detail`
  }, titleDom, descriptionDom) : null;
  return React109.createElement("div", Object.assign({}, others, {
    className: classString
  }), avatarDom, MetaDetail);
};
var Meta_default = Meta;

// node_modules/antd/es/card/index.js
var Card2 = Card_default;
Card2.Grid = Grid_default;
Card2.Meta = Meta_default;
if (true) {
  Card2.displayName = "Card";
}
var card_default = Card2;

export {
  toArray,
  getDOM,
  ResizeObserver_es_default,
  es_default2 as es_default,
  raf_default,
  Context_default,
  validateMessagesContext_default,
  en_US_default,
  en_US_default4 as en_US_default2,
  en_US_default5 as en_US_default3,
  en_US_default6 as en_US_default4,
  getConfirmLocale,
  useLocale_default,
  DisabledContextProvider,
  DisabledContext_default,
  CSSMotionList_default,
  es_default as es_default2,
  warnContext,
  globalConfig,
  config_provider_default,
  warning2 as warning,
  svgBaseProps,
  useInsertStyles,
  AntdIcon_default,
  CloseOutlined_default2 as CloseOutlined_default,
  useCSSVarCls_default,
  KeyCode_default,
  _regeneratorRuntime,
  _asyncToGenerator,
  getTransitionName2 as getTransitionName,
  motion_default,
  omit,
  isVisible_default,
  collapse_default,
  initMotion,
  initFadeMotion,
  initMoveMotion,
  slideUpIn,
  slideUpOut,
  slideDownIn,
  slideDownOut,
  initSlideMotion,
  zoomIn,
  initZoomMotion,
  getScrollBarSize,
  getTargetScrollBarSize,
  es_default3,
  useId_default,
  FieldContext_default,
  ListContext_default,
  Field_default,
  List_default,
  useForm_default,
  useWatch_default,
  es_default10 as es_default4,
  FormContext2 as FormContext,
  NoStyleItemContext,
  FormProvider3 as FormProvider,
  FormItemPrefixContext,
  FormItemInputContext,
  NoFormStyle,
  VariantContext,
  skeleton_default,
  isMobile_default,
  es_default6 as es_default5,
  es_default4 as es_default6,
  useVariants_default,
  es_default5 as es_default7,
  useFullPath,
  MenuItem_default,
  SubMenu_default,
  Divider,
  MenuItemGroup_default,
  es_default7 as es_default8,
  EllipsisOutlined_default2 as EllipsisOutlined_default,
  tabs_default,
  card_default
};
/*! Bundled license information:

@babel/runtime/helpers/esm/regenerator.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
//# sourceMappingURL=chunk-EC6UIERS.js.map
