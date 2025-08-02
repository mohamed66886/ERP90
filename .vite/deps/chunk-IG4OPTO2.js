import {
  devUseWarning,
  genStyleHooks,
  merge2 as merge,
  resetComponent,
  unit,
  useComponentConfig,
  useSize_default
} from "./chunk-GGF5EFL3.js";
import {
  require_classnames
} from "./chunk-KUJFIW67.js";
import {
  require_react
} from "./chunk-2CLD7BNN.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/antd/es/divider/index.js
var React = __toESM(require_react());
var import_classnames = __toESM(require_classnames());

// node_modules/antd/es/divider/style/index.js
var genSizeDividerStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: {
      "&-horizontal": {
        [`&${componentCls}`]: {
          "&-sm": {
            marginBlock: token.marginXS
          },
          "&-md": {
            marginBlock: token.margin
          }
        }
      }
    }
  };
};
var genSharedDividerStyle = (token) => {
  const {
    componentCls,
    sizePaddingEdgeHorizontal,
    colorSplit,
    lineWidth,
    textPaddingInline,
    orientationMargin,
    verticalMarginInline
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      borderBlockStart: `${unit(lineWidth)} solid ${colorSplit}`,
      // vertical
      "&-vertical": {
        position: "relative",
        top: "-0.06em",
        display: "inline-block",
        height: "0.9em",
        marginInline: verticalMarginInline,
        marginBlock: 0,
        verticalAlign: "middle",
        borderTop: 0,
        borderInlineStart: `${unit(lineWidth)} solid ${colorSplit}`
      },
      "&-horizontal": {
        display: "flex",
        clear: "both",
        width: "100%",
        minWidth: "100%",
        // Fix https://github.com/ant-design/ant-design/issues/10914
        margin: `${unit(token.marginLG)} 0`
      },
      [`&-horizontal${componentCls}-with-text`]: {
        display: "flex",
        alignItems: "center",
        margin: `${unit(token.dividerHorizontalWithTextGutterMargin)} 0`,
        color: token.colorTextHeading,
        fontWeight: 500,
        fontSize: token.fontSizeLG,
        whiteSpace: "nowrap",
        textAlign: "center",
        borderBlockStart: `0 ${colorSplit}`,
        "&::before, &::after": {
          position: "relative",
          width: "50%",
          borderBlockStart: `${unit(lineWidth)} solid transparent`,
          // Chrome not accept `inherit` in `border-top`
          borderBlockStartColor: "inherit",
          borderBlockEnd: 0,
          transform: "translateY(50%)",
          content: "''"
        }
      },
      [`&-horizontal${componentCls}-with-text-start`]: {
        "&::before": {
          width: `calc(${orientationMargin} * 100%)`
        },
        "&::after": {
          width: `calc(100% - ${orientationMargin} * 100%)`
        }
      },
      [`&-horizontal${componentCls}-with-text-end`]: {
        "&::before": {
          width: `calc(100% - ${orientationMargin} * 100%)`
        },
        "&::after": {
          width: `calc(${orientationMargin} * 100%)`
        }
      },
      [`${componentCls}-inner-text`]: {
        display: "inline-block",
        paddingBlock: 0,
        paddingInline: textPaddingInline
      },
      "&-dashed": {
        background: "none",
        borderColor: colorSplit,
        borderStyle: "dashed",
        borderWidth: `${unit(lineWidth)} 0 0`
      },
      [`&-horizontal${componentCls}-with-text${componentCls}-dashed`]: {
        "&::before, &::after": {
          borderStyle: "dashed none none"
        }
      },
      [`&-vertical${componentCls}-dashed`]: {
        borderInlineStartWidth: lineWidth,
        borderInlineEnd: 0,
        borderBlockStart: 0,
        borderBlockEnd: 0
      },
      "&-dotted": {
        background: "none",
        borderColor: colorSplit,
        borderStyle: "dotted",
        borderWidth: `${unit(lineWidth)} 0 0`
      },
      [`&-horizontal${componentCls}-with-text${componentCls}-dotted`]: {
        "&::before, &::after": {
          borderStyle: "dotted none none"
        }
      },
      [`&-vertical${componentCls}-dotted`]: {
        borderInlineStartWidth: lineWidth,
        borderInlineEnd: 0,
        borderBlockStart: 0,
        borderBlockEnd: 0
      },
      [`&-plain${componentCls}-with-text`]: {
        color: token.colorText,
        fontWeight: "normal",
        fontSize: token.fontSize
      },
      [`&-horizontal${componentCls}-with-text-start${componentCls}-no-default-orientation-margin-start`]: {
        "&::before": {
          width: 0
        },
        "&::after": {
          width: "100%"
        },
        [`${componentCls}-inner-text`]: {
          paddingInlineStart: sizePaddingEdgeHorizontal
        }
      },
      [`&-horizontal${componentCls}-with-text-end${componentCls}-no-default-orientation-margin-end`]: {
        "&::before": {
          width: "100%"
        },
        "&::after": {
          width: 0
        },
        [`${componentCls}-inner-text`]: {
          paddingInlineEnd: sizePaddingEdgeHorizontal
        }
      }
    })
  };
};
var prepareComponentToken = (token) => ({
  textPaddingInline: "1em",
  orientationMargin: 0.05,
  verticalMarginInline: token.marginXS
});
var style_default = genStyleHooks("Divider", (token) => {
  const dividerToken = merge(token, {
    dividerHorizontalWithTextGutterMargin: token.margin,
    sizePaddingEdgeHorizontal: 0
  });
  return [genSharedDividerStyle(dividerToken), genSizeDividerStyle(dividerToken)];
}, prepareComponentToken, {
  unitless: {
    orientationMargin: true
  }
});

// node_modules/antd/es/divider/index.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var sizeClassNameMap = {
  small: "sm",
  middle: "md"
};
var Divider = (props) => {
  const {
    getPrefixCls,
    direction,
    className: dividerClassName,
    style: dividerStyle
  } = useComponentConfig("divider");
  const {
    prefixCls: customizePrefixCls,
    type = "horizontal",
    orientation = "center",
    orientationMargin,
    className,
    rootClassName,
    children,
    dashed,
    variant = "solid",
    plain,
    style,
    size: customSize
  } = props, restProps = __rest(props, ["prefixCls", "type", "orientation", "orientationMargin", "className", "rootClassName", "children", "dashed", "variant", "plain", "style", "size"]);
  const prefixCls = getPrefixCls("divider", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const sizeFullName = useSize_default(customSize);
  const sizeCls = sizeClassNameMap[sizeFullName];
  const hasChildren = !!children;
  const mergedOrientation = React.useMemo(() => {
    if (orientation === "left") {
      return direction === "rtl" ? "end" : "start";
    }
    if (orientation === "right") {
      return direction === "rtl" ? "start" : "end";
    }
    return orientation;
  }, [direction, orientation]);
  const hasMarginStart = mergedOrientation === "start" && orientationMargin != null;
  const hasMarginEnd = mergedOrientation === "end" && orientationMargin != null;
  const classString = (0, import_classnames.default)(prefixCls, dividerClassName, hashId, cssVarCls, `${prefixCls}-${type}`, {
    [`${prefixCls}-with-text`]: hasChildren,
    [`${prefixCls}-with-text-${mergedOrientation}`]: hasChildren,
    [`${prefixCls}-dashed`]: !!dashed,
    [`${prefixCls}-${variant}`]: variant !== "solid",
    [`${prefixCls}-plain`]: !!plain,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-no-default-orientation-margin-start`]: hasMarginStart,
    [`${prefixCls}-no-default-orientation-margin-end`]: hasMarginEnd,
    [`${prefixCls}-${sizeCls}`]: !!sizeCls
  }, className, rootClassName);
  const memoizedOrientationMargin = React.useMemo(() => {
    if (typeof orientationMargin === "number") {
      return orientationMargin;
    }
    if (/^\d+$/.test(orientationMargin)) {
      return Number(orientationMargin);
    }
    return orientationMargin;
  }, [orientationMargin]);
  const innerStyle = {
    marginInlineStart: hasMarginStart ? memoizedOrientationMargin : void 0,
    marginInlineEnd: hasMarginEnd ? memoizedOrientationMargin : void 0
  };
  if (true) {
    const warning = devUseWarning("Divider");
    true ? warning(!children || type !== "vertical", "usage", "`children` not working in `vertical` mode.") : void 0;
  }
  return wrapCSSVar(React.createElement("div", Object.assign({
    className: classString,
    style: Object.assign(Object.assign({}, dividerStyle), style)
  }, restProps, {
    role: "separator"
  }), children && type !== "vertical" && React.createElement("span", {
    className: `${prefixCls}-inner-text`,
    style: innerStyle
  }, children)));
};
if (true) {
  Divider.displayName = "Divider";
}
var divider_default = Divider;

export {
  divider_default
};
//# sourceMappingURL=chunk-IG4OPTO2.js.map
