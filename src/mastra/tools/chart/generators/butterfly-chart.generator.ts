import { z } from "zod";
import {
  BaseChartTool,
  BaseChartInput,
  BaseChartOutput,
} from "../interfaces/chart-tool.interface";
import { SchemaMerger } from "../utils/schema-merger";
import {
  generateDefaultTitle,
  generateDefaultBackground,
  generateDefaultLegend,
  getThemeColors,
} from "../utils/chart-helpers";

// 蝴蝶图特定输入接口
export interface ButterflyChartInput extends BaseChartInput {
  data: Array<Array<Array<string | number>>>; // [分类, 左值, 右值]
  title?: string;
  subtitle?: string;
  showLabels?: boolean;
  colors?: string[]; // 左右两侧的颜色
  barHeight?: number; // 条形高度百分比 (0-1)
  centerGap?: number; // 中间间隔距离
  symmetrical?: boolean; // 是否对称显示
  chartType: "butterfly";
}

// 蝴蝶图特定输出接口
export interface ButterflyChartOutput extends BaseChartOutput {
  props: {
    type: "butterfly";
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
      bar: {
        widthPercent: number;
        border: any;
      };
      butterfly: {
        centerGap: number;
        symmetrical: boolean;
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
export const ButterflyChartInputSchema = z.object({
  data: z.array(z.array(z.array(z.union([z.string(), z.number()])))),
  title: z.string().optional().default("蝴蝶图"),
  subtitle: z.string().optional().default("副标题"),
  showLabels: z.boolean().optional().default(false),
  colors: z.array(z.string()).optional(),
  barHeight: z.number().min(0.1).max(1).optional().default(0.7),
  centerGap: z.number().min(0).max(50).optional().default(10),
  symmetrical: z.boolean().optional().default(true),
  chartType: z.literal("butterfly"),
});

export class ButterflyChartGenerator extends BaseChartTool {
  constructor() {
    super("butterfly");
  }

  protected getElementType(): string {
    return "bar";
  }

  async generateConfig(
    input: ButterflyChartInput
  ): Promise<ButterflyChartOutput> {
    // 验证输入
    const validatedInput = ButterflyChartInputSchema.parse(input);
    const inputWithChartType = { ...validatedInput, chartType: "butterfly" };
    const mergedInput = this.mergeWithDefaults(inputWithChartType);

    // 获取默认配置
    const themeColors = getThemeColors(mergedInput.theme || "light", 2);
    // 左右两侧默认颜色
    const colors = validatedInput.colors || [
      themeColors[0].color,
      themeColors[1].color,
    ];
    // 构建数据映射（Y轴分类，左右X轴数值）
    const map = [
      {
        name: "Y轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        yAxisIndex: 0,
        type: "",
      },
      {
        name: "左值",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        xAxisIndex: 0, // 左侧X轴
        type: "bar",
      },
      {
        name: "右值",
        index: 2,
        isLegend: false,
        function: "vCol",
        configurable: true,
        xAxisIndex: 1, // 右侧X轴
        type: "bar",
      },
    ];

    // 构建填充配置（左右两种颜色）
    const fill = {
      controlType: "multiple" as const,
      props: [
        {
          color: { color: colors[0] || "#FF6B6B", opacity: 1 },
          texture: { url: "" },
          shadow: {
            show: false,
            type: "outer" as const,
            angle: 45,
            blur: 5,
            color: { color: "#000000", opacity: 0.3 },
            radius: 3,
          },
          border: {
            type: "solid" as const,
            width: 0,
            color: null,
          },
        },
        {
          color: { color: colors[1] || "#4ECDC4", opacity: 1 },
          texture: { url: "" },
          shadow: {
            show: false,
            type: "outer" as const,
            angle: 45,
            blur: 5,
            color: { color: "#000000", opacity: 0.3 },
            radius: 3,
          },
          border: {
            type: "solid" as const,
            width: 0,
            color: null,
          },
        },
      ],
    };

    // 构建显示配置
    const display = {
      bar: {
        widthPercent: validatedInput.barHeight || 0.7,
        border: {
          radius: [0, 0, 0, 0],
          type: "solid" as const,
          width: 0,
          color: null,
        },
      },
      butterfly: {
        centerGap: validatedInput.centerGap || 10,
        symmetrical: validatedInput.symmetrical !== false,
      },
    };

    // 构建标签配置
    const label = {
      show: validatedInput.showLabels || false,
      barLabel: {
        show: validatedInput.showLabels || false,
        positionChoice: "center" as const,
        fontFamily: "Misans 常规",
        fontSize: 12,
        color: { color: "#333333", opacity: 1 },
        suffix: "",
      },
      highlight: false,
      overlap: false,
    };

    // 构建坐标轴配置（蝴蝶图有两个X轴，一个Y轴）
    const axis = {
      show: true,
      xAxis: [
        // 左侧X轴
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
            suffix: "",
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          position: "bottom" as const,
          type: "value" as const,
          max: "auto" as const,
          min: "auto" as const,
          inverse: true, // 左侧数值反向显示
        },
        // 右侧X轴
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
            suffix: "",
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          position: "bottom" as const,
          type: "value" as const,
          max: "auto" as const,
          min: "auto" as const,
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
          position: "center" as const, // 居中位置
          type: "category" as const,
        },
      ],
    };

    return {
      data: validatedInput.data,
      pipe: "key_value",
      props: {
        type: "butterfly",
        title: generateDefaultTitle(
          validatedInput.title,
          validatedInput.subtitle
        ),
        background: generateDefaultBackground(),
        map: map as any,
        fill,
        display,
        legend: generateDefaultLegend(),
        label,
        axis: axis,
        numberFormat: {
          separatorType: "1000.00" as const,
          decimalPlaces: null,
        },
        animation: {
          show: false,
          transition: false,
          moveStyle: null,
          duration: 2,
          startDelay: 0,
          endPause: 1,
          loop: false,
        },
        tooltip: false,
        padding: {
          top: 20,
          bottom: 23,
          left: 24,
          right: 24,
        },
      },
    };
  }

  getInputSchema(): z.ZodType<ButterflyChartInput> {
    return ButterflyChartInputSchema;
  }

  getOutputSchema(): z.ZodType<ButterflyChartOutput> {
    return z.any(); // 可以根据需要进一步细化
  }

  async loadSchema(): Promise<any> {
    const schemaMerger = new SchemaMerger();
    return schemaMerger.getMergedSchema("butterfly");
  }
}
