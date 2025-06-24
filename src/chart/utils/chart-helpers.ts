import {
  BaseChartInput,
  BaseChartOutput,
} from "../interfaces/chart-tool.interface";
import chroma from "chroma-js";

/**
 * 默认颜色主题
 */
export const DEFAULT_COLORS = {
  light: [
    { color: "#5AAEF3", opacity: 1 },
    { color: "#FF6B9D", opacity: 1 },
    { color: "#4ECDC4", opacity: 1 },
    { color: "#45B7D1", opacity: 1 },
    { color: "#96CEB4", opacity: 1 },
    { color: "#FFEAA7", opacity: 1 },
    { color: "#DDA0DD", opacity: 1 },
    { color: "#98D8C8", opacity: 1 },
  ],
  dark: [
    { color: "#3B82F6", opacity: 1 },
    { color: "#EF4444", opacity: 1 },
    { color: "#10B981", opacity: 1 },
    { color: "#F59E0B", opacity: 1 },
    { color: "#8B5CF6", opacity: 1 },
    { color: "#06B6D4", opacity: 1 },
    { color: "#84CC16", opacity: 1 },
    { color: "#F97316", opacity: 1 },
  ],
};

/**
 * 生成默认标题配置
 */
export function generateDefaultTitle(title?: string, subtitle?: string) {
  return {
    show: !!title,
    mainTitle: {
      show: !!title,
      text: title || "图表标题",
      fontFamily: "Misans 常规",
      fontSize: 24,
      color: { color: "#333333", opacity: 1 },
      position: { x: "center", y: "top" },
    },
    subTitle: {
      show: !!subtitle,
      text: subtitle || "",
      fontSize: 16,
      color: { color: "#666666", opacity: 1 },
      fontFamily: "Misans 常规",
    },
  };
}

/**
 * 生成默认背景配置
 */
export function generateDefaultBackground(theme: "light" | "dark" = "light") {
  return {
    show: false,
    color: {
      color: theme === "light" ? "#ffffff" : "#1a1a1a",
      opacity: 1,
    },
    border: { radius: 0 },
    blur: 0,
  };
}

/*
默认显示图例图表类型
*/
export const DEFAULT_SHOW_LEGEND_CHART_TYPES = [
  "stacked-column",
  "stacked-bar",
  "stacked-area",
  "river-area",
  "mixed-line-stacked-column",
  "mixed-line-grouped-column",
  "grouped-column",
  "grouped-bar",
  "difference-arrow-column",
  "difference-arrow-bar",
  "descartes-heatmap",
  "cascaded-area",
  "butterfly",
  "basic-radar",
  "basic-line",
];

/**
 * 生成默认图例配置
 */
export function generateDefaultLegend(show: boolean = false) {
  return {
    show,
    display: "horizontal",
    position: { x: "center", y: "bottom" },
    fontFamily: "Misans 常规",
    fontSize: 14,
    color: { color: "#333333", opacity: 1 },
  };
}

/**
 * 生成默认数字格式配置
 */
export function generateDefaultNumberFormat() {
  return {
    separatorType: "1000.00",
    decimalPlaces: null,
  };
}

/**
 * 生成默认动画配置
 */
export function generateDefaultAnimation() {
  return {
    show: false,
    transition: false,
    moveStyle: null,
    duration: 2,
    startDelay: 0,
    endPause: 1,
    loop: false,
  };
}

/**
 * 生成默认内边距配置
 */
export function generateDefaultPadding() {
  return {
    top: 20,
    bottom: 23,
    left: 24,
    right: 24,
  };
}

/**
 * 根据主题获取颜色
 */
export function getThemeColors(
  theme: "light" | "dark" = "light",
  count: number = 1
) {
  const colors = DEFAULT_COLORS[theme];
  const result = [];

  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * 为图表生成颜色
 * 重点关注：区分度、无障碍性、视觉舒适性
 */
function generateChartColors(
  baseColors: string[],
  totalCount: number
): string[] {
  const result = [...baseColors];
  const remainingCount = totalCount - baseColors.length;

  if (remainingCount <= 0) return result;

  // 为图表优化的色相分布：确保最大区分度
  const usedHues = baseColors.map((color) => {
    const [h] = chroma(color).hsl();
    return h || 0;
  });

  // 计算所有色相的"禁区"（避免生成太相近的颜色）
  const minHueDistance = 30; // 最小色相距离

  for (let i = 0; i < remainingCount; i++) {
    const baseIndex = i % baseColors.length;
    const baseColor = chroma(baseColors[baseIndex]);
    const [baseHue, baseSat, baseLit] = baseColor.hsl();

    // 寻找最佳的新色相
    let bestHue = baseHue || 0;
    let maxDistance = 0;

    // 尝试多个色相，选择与现有颜色距离最远的
    for (let testHue = 0; testHue < 360; testHue += 15) {
      const minDistanceToExisting = Math.min(
        ...usedHues.map((existingHue) => {
          const distance = Math.min(
            Math.abs(testHue - existingHue),
            360 - Math.abs(testHue - existingHue)
          );
          return distance;
        })
      );

      if (
        minDistanceToExisting > maxDistance &&
        minDistanceToExisting >= minHueDistance
      ) {
        maxDistance = minDistanceToExisting;
        bestHue = testHue;
      }
    }

    // 如果找不到足够远的色相，使用均匀分布
    if (maxDistance < minHueDistance) {
      bestHue = ((baseHue || 0) + (i + 1) * (360 / remainingCount)) % 360;
    }

    // 调整饱和度和亮度以适合图表显示
    const newSaturation = Math.max(
      0.6,
      Math.min(0.9, (baseSat || 0.7) + (i % 2 === 0 ? 0.1 : -0.1))
    );
    const newLightness = Math.max(
      0.4,
      Math.min(
        0.7,
        (baseLit || 0.5) + (i % 3 === 0 ? 0.1 : i % 3 === 1 ? -0.1 : 0)
      )
    );

    const newColor = chroma.hsl(bestHue, newSaturation, newLightness).hex();
    result.push(newColor);
    usedHues.push(bestHue);
  }

  return result;
}

/**
 * 为图表生成颜色（优化版）
 * 核心策略：使用黄金角算法保证色相最大区分度，同时微调饱和度和亮度。
 * @param baseColors 基础颜色数组
 * @param totalCount 总共需要的颜色数量
 * @returns {string[]} 生成的颜色数组
 */
export function getColors(
  baseColors: string[] | undefined,
  totalCount: number
): string[] {
  if (!baseColors || baseColors.length === 0) {
    return [];
  }
  if (totalCount <= 0) {
    return [];
  }

  if (totalCount <= baseColors.length) {
    return baseColors.slice(0, totalCount);
  }

  const result = [...baseColors];
  const remainingCount = totalCount - baseColors.length;

  // 黄金角，~137.5度。这是在圆上均匀分布点的魔法数字。
  const GOLDEN_ANGLE = 137.5;

  // 使用最后一个基础颜色作为我们生成新颜色的起点
  // 如果没有基础颜色，则随机开始一个
  const lastBaseColor =
    baseColors.length > 0
      ? chroma(baseColors[baseColors.length - 1])
      : chroma.random();
  let lastHue = lastBaseColor.hsl()[0] || 0;

  for (let i = 0; i < remainingCount; i++) {
    // 1. 色相 (Hue)：使用黄金角算法高效地找到下一个最分散的色相
    const newHue = (lastHue + GOLDEN_ANGLE) % 360;

    // 2. 饱和度 (Saturation) 和 3. 亮度 (Lightness)：
    // 进行周期性微调和范围限制
    const baseSat = lastBaseColor.hsl()[1] || 0.7;
    const baseLit = lastBaseColor.hsl()[2] || 0.5;

    // 周期性调整饱和度，使其在 [0.6, 0.8] 范围内波动
    const newSaturation = Math.max(
      0.6,
      Math.min(0.8, baseSat + (i % 2 === 0 ? 0.05 : -0.05))
    );

    // 周期性调整亮度，使其在 [0.5, 0.75] 范围内波动 (提升亮度以保证对比度)
    const newLightness = Math.max(
      0.5,
      Math.min(0.75, baseLit + (i % 3 === 0 ? 0.08 : i % 3 === 1 ? -0.05 : 0))
    );

    const newColor = chroma.hsl(newHue, newSaturation, newLightness);

    // （可选的无障碍性检查）确保与白色背景的对比度足够
    // if (chroma.contrast(newColor, 'white') < 4.5) {
    //   // 如果对比度不足，可以尝试提高亮度
    //   newColor = newColor.set('hsl.l', '*1.1');
    // }

    result.push(newColor.hex());
    lastHue = newHue; // 更新色相，为下一次迭代做准备
  }

  return result;
}

/**
 * 生成默认填充配置
 */
export function generateDefaultFill(
  chartType: string,
  theme: "light" | "dark" = "light",
  dataLength: number = 1
) {
  const colors = getThemeColors(theme, dataLength);
  const controlType = dataLength > 1 ? "multiple" : "single";

  return {
    controlType,
    props: colors.map((color) => ({
      color,
      shadow: {
        show: false,
        type: "outer",
        angle: 45,
        blur: chartType.includes("progress") ? 2 : 5,
        color: {
          color: "#000000",
          opacity: chartType.includes("progress") ? 0.1 : 0.3,
        },
        radius: chartType.includes("progress") ? 1 : 3,
      },
      border: {
        type: "solid",
        width: 0,
        color: null,
      },
    })),
  };
}

/**
 * 生成默认标签配置
 */
export function generateDefaultLabel() {
  return {
    show: false,
    numberLabel: {
      show: false,
      positionChoice: "right",
      fontFamily: "Misans 常规",
      fontSize: 21,
      color: { color: "#333333", opacity: 1 },
    },
    highlight: false,
    overlap: false,
  };
}

/**
 * 处理图表数据格式
 */
export function processChartData(data: any[][][]): any[][][] {
  if (!data || data.length === 0) {
    throw new Error("Data is required for chart generation");
  }

  // 确保数据格式为三维数组
  return data;
}

/**
 * 验证数据格式
 */
export function validateChartData(data: any[][][]): void {
  if (!Array.isArray(data)) {
    throw new Error("Data must be an array");
  }

  if (data[0].length < 2) {
    throw new Error("Data must have at least 2 rows (header and data)");
  }

  const headerLength = data[0][0]?.length || 0;
  if (headerLength < 2) {
    throw new Error("Data must have at least 2 columns");
  }

  // 验证每行数据长度一致
  for (let i = 1; i < data[0].length; i++) {
    if (data[0][i].length !== headerLength) {
      throw new Error(`Row ${i} has inconsistent column count`);
    }
  }
}

/**
 * 生成图表的默认 props 配置
 */
export function generateDefaultProps(
  chartType: string,
  input: BaseChartInput
): BaseChartOutput["props"] {
  const theme = input.theme || "light";
  const dataLength = input.data ? input.data[0].length - 1 : 1; // 减去header行

  return {
    type: chartType,
    title: generateDefaultTitle(input.title, input.subtitle),
    background: generateDefaultBackground(theme),
    legend: generateDefaultLegend(
      DEFAULT_SHOW_LEGEND_CHART_TYPES.includes(chartType)
    ),
    numberFormat: generateDefaultNumberFormat(),
    animation: generateDefaultAnimation(),
    tooltip: false,
    padding: generateDefaultPadding(),
    fill: generateDefaultFill(chartType, theme, dataLength),
    label: generateDefaultLabel(),
  };
}

/**
 * 创建完整的图表配置输出
 */
export function createChartOutput(
  chartType: string,
  input: BaseChartInput,
  customProps: Partial<BaseChartOutput["props"]> = {}
): BaseChartOutput {
  if (!input.data) {
    throw new Error("Data is required for chart generation");
  }

  validateChartData(input.data);

  const processedData = input.data;
  const defaultProps = generateDefaultProps(chartType, input);

  return {
    data: processedData,
    pipe: "key_value",
    props: {
      ...defaultProps,
      ...customProps,
    },
  };
}

/**
 * 深度合并对象
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof result[key] === "object" &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }

  return result;
}
