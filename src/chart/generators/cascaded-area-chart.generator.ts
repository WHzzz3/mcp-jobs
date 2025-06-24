import { z } from "zod";
import {
  BaseChartTool,
  BaseChartInput,
  BaseChartOutput,
} from "../interfaces/chart-tool.interface";
// import { SchemaMerger } from "../utils/schema-merger";
import {
  generateDefaultTitle,
  generateDefaultBackground,
  generateDefaultLegend,
  getThemeColors,
  getColors,
} from "../utils/chart-helpers";

// 层叠面积图特定输入接口
export interface CascadedAreaChartInput extends BaseChartInput {
  data: Array<Array<Array<string | number>>>; // 多系列时间序列数据
  title?: string;
  subtitle?: string;
  showLabels?: boolean;
  colors?: string[];
  areaType?: "straight" | "curve"; // 边界线类型
  areaOpacity?: number; // 区域透明度
  stackMode?: "normal" | "percent"; // 堆叠模式
  chartType: "cascaded-area";
}

// 层叠面积图特定输出接口
export interface CascadedAreaChartOutput extends BaseChartOutput {
  props: {
    type: "cascaded-area";
    title: any;
    background: any;
    map: Array<{
      name: string;
      index: number;
      isLegend: boolean;
      function: string;
      configurable: boolean;
      yAxisIndex?: number;
      xAxisIndex?: number;
      type: string;
    }>;
    fill: any;
    display: {
      area: {
        type: string;
        width: number;
        opacity: number;
        stackMode: string;
      };
    };
    legend: any;
    label: any;
    axis: any;
    numberFormat: any;
    animation: any;
    tooltip: boolean;
    padding: any;
  };
}

// Zod验证schema
export const CascadedAreaChartInputSchema = z.object({
  data: z.array(z.array(z.array(z.union([z.string(), z.number()])))),
  title: z.string().optional().default("层叠面积图"),
  subtitle: z.string().optional().default("副标题"),
  showLabels: z.boolean().optional().default(false),
  colors: z.array(z.string()).optional(),
  areaType: z.enum(["straight", "curve"]).optional().default("straight"),
  areaOpacity: z.number().min(0).max(1).optional().default(0.8),
  stackMode: z.enum(["normal", "percent"]).optional().default("normal"),
  chartType: z.literal("cascaded-area"),
});

export class CascadedAreaChartGenerator extends BaseChartTool {
  constructor() {
    super("cascaded-area");
  }

  protected getElementType(): string {
    return "area";
  }

  async generateConfig(
    input: CascadedAreaChartInput
  ): Promise<CascadedAreaChartOutput> {
    // 验证输入
    const validatedInput = CascadedAreaChartInputSchema.parse(input);
    const inputWithChartType = {
      ...validatedInput,
      chartType: "cascaded-area",
    };
    const mergedInput = this.mergeWithDefaults(inputWithChartType);

    // 获取数据维度
    const firstRow = validatedInput.data[0][0];
    const seriesCount = firstRow ? firstRow.length - 1 : 0; // 减去第一列（时间轴）

    // 获取默认配置
    const themeColors = getThemeColors(
      mergedInput.theme || "light",
      seriesCount
    );
    const colors =
      getColors(validatedInput.colors, seriesCount) ||
      themeColors.map((c: any) => c.color);

    // 构建数据映射（X轴时间，多个Y轴数值系列）
    const map = [
      {
        name: "X轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: "",
      },
    ];

    // 为每个数值系列添加映射
    for (let i = 1; i <= seriesCount; i++) {
      map.push({
        name: "数值列",
        index: i,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "area",
      } as any);
    }

    // 构建填充配置
    const fill = {
      controlType: "multiple" as const,
      props: colors.slice(0, seriesCount).map((color: string) => ({
        color: { color: color, opacity: validatedInput.areaOpacity || 0.8 },
        texture: { url: "" },
        shadow: {
          show: false,
          type: "outer" as const,
          angle: 45,
          blur: 5,
          color: { color: "#000000", opacity: 0.1 },
          radius: 3,
        },
      })),
    };

    // 构建显示配置
    const display = {
      area: {
        type: validatedInput.areaType || "straight",
        width: 2,
        opacity: validatedInput.areaOpacity || 0.8,
        stackMode: validatedInput.stackMode || "normal",
      },
    };

    // 构建标签配置
    const label = {
      show: validatedInput.showLabels || false,
      areaLabel: {
        show: validatedInput.showLabels || false,
        positionChoice: "top" as const,
        fontFamily: "Misans 常规",
        fontSize: 12,
        color: { color: "#333333", opacity: 1 },
        suffix: "",
      },
      highlight: false,
      overlap: false,
    };

    // 构建坐标轴配置
    const axis = {
      show: true,
      xAxis: [
        {
          line: {
            show: true,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 },
          },
          label: {
            show: true,
            direction: "auto" as const,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            angle: 0,
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          position: "bottom" as const,
          type: "category" as const,
        },
      ],
      yAxis: [
        {
          line: {
            show: true,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 },
          },
          label: {
            show: true,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            angle: 0,
            suffix: validatedInput.stackMode === "percent" ? "%" : "",
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          position: "left" as const,
          type: "value" as const,
          max: validatedInput.stackMode === "percent" ? 100 : ("auto" as const),
          min: "auto" as const,
        },
      ],
    };

    // 构建数字格式配置
    const numberFormat = {
      separatorType: "1000.00",
      decimalPlaces: null,
    };

    // 构建动画配置
    const animation = {
      show: false,
      transition: false,
      moveStyle: null,
      duration: 2,
      startDelay: 0,
      endPause: 1,
      loop: false,
    };

    // 构建内边距配置
    const padding = {
      top: 20,
      bottom: 23,
      left: 24,
      right: 24,
    };

    return {
      data: validatedInput.data,
      pipe: "cross",
      props: {
        type: "cascaded-area",
        title: generateDefaultTitle(
          validatedInput.title,
          validatedInput.subtitle
        ),
        background: generateDefaultBackground(),
        map,
        fill,
        display,
        legend: generateDefaultLegend(true),
        label,
        axis,
        numberFormat,
        animation,
        tooltip: false,
        padding,
      },
    };
  }

  getInputSchema(): z.ZodType<CascadedAreaChartInput> {
    return CascadedAreaChartInputSchema;
  }

  getOutputSchema(): z.ZodType<CascadedAreaChartOutput> {
    return z.any(); // 可以根据需要进一步细化
  }

  // async loadSchema(): Promise<any> {
  //   const schemaMerger = new SchemaMerger();
  //   return schemaMerger.getMergedSchema("cascaded-area");
  // }
}
