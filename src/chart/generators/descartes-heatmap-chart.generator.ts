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
  createChartOutput,
  getColors,
} from "../utils/chart-helpers";

// 笛卡尔热力图特定输入接口
export interface DescartesHeatmapChartInput
  extends Omit<BaseChartInput, "chartType"> {
  data: Array<Array<Array<string | number>>>; // [Y轴分类, X轴值1, X轴值2, ...] 格式
  gapDistance?: number; // 单元格间距
  borderRadius?: number[]; // 边框圆角
  useGradient?: boolean; // 是否使用渐变色
  showLabels?: boolean;
}

// 笛卡尔热力图特定输出接口
export interface DescartesHeatmapChartOutput extends BaseChartOutput {
  props: {
    type: "descartes-heatmap";
    title: any;
    background: any;
    map: Array<{
      name: string;
      index: number;
      isLegend: boolean;
      function: string;
      configurable: boolean;
      xAxisIndex?: number;
      yAxisIndex?: number;
      type: string;
    }>;
    fill: any;
    display: {
      bar: {
        gapDistance: number;
        border: any;
        fillOpacity: number;
      };
    };
    legend: any;
    label: any;
    axis: any;
  };
}

// Zod验证schema
export const DescartesHeatmapChartInputSchema = z.object({
  data: z.array(z.array(z.array(z.union([z.string(), z.number()])))),
  title: z.string().optional().default("笛卡尔热力图"),
  subtitle: z.string().optional().default("副标题"),
  colors: z.array(z.string()).optional(),
  gapDistance: z.number().min(0).optional().default(0),
  borderRadius: z.array(z.number()).length(4).optional().default([0, 0, 0, 0]),
  useGradient: z.boolean().optional().default(true),
  showLabels: z.boolean().optional().default(false),
});

export class DescartesHeatmapChartGenerator extends BaseChartTool {
  constructor() {
    super("descartes-heatmap");
  }

  protected getElementType(): string {
    return "bar";
  }

  async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    // 验证输入
    const validatedInput = DescartesHeatmapChartInputSchema.parse(input);
    const inputWithChartType = {
      ...validatedInput,
      chartType: "descartes-heatmap",
    };
    const mergedInput = this.mergeWithDefaults(inputWithChartType);

    // 获取数据结构信息
    const headerRow = validatedInput.data[0][0];
    const xAxisCount = headerRow.length - 1; // 除去第一列（Y轴分类列）的X轴数据数量

    // 构建数据映射 - 热力图需要Y轴分类和多个X轴数据列
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
      // 为每个X轴数据列创建映射
      ...Array.from({ length: xAxisCount }, (_, i) => ({
        name: "数值列",
        index: i + 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        xAxisIndex: 0,
        type: "bar",
      })),
    ];
    const colors = getColors(validatedInput.colors, 3);
    // 构建填充配置 - 热力图通常使用单一渐变色
    const fill = {
      controlType: "single" as const,
      props: [
        {
          color: validatedInput.useGradient
            ? {
                color: {
                  type: "linear" as const,
                  angle: 0,
                  colorStops: [
                    {
                      color: colors?.[0] || "#5AAEF3",
                      opacity: 1,
                      offset: 0,
                    },
                    {
                      color: colors?.[1] || "#FFE88E",
                      opacity: 1,
                      offset: 0.5,
                    },
                    {
                      color: colors?.[2] || "#E65A56",
                      opacity: 1,
                      offset: 1,
                    },
                  ],
                },
                opacity: 1,
              }
            : { color: "#5AAEF3", opacity: 1 },
          texture: { url: "" },
          shadow: {
            show: false,
            type: "outer" as const,
            angle: 45,
            blur: 0,
            color: { color: "#000000", opacity: 0.5 },
            radius: 0,
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
        gapDistance: validatedInput.gapDistance || 0,
        fillOpacity: 1,
        border: {
          radius: validatedInput.borderRadius || [0, 0, 0, 0],
          type: "solid" as const,
          width: 0,
          color: null,
        },
      },
    };

    // 构建标签配置
    const label = {
      show: validatedInput.showLabels || false,
      barLabel: {
        show: validatedInput.showLabels || false,
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
            show: false,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 },
          },
          label: {
            show: true,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            suffix: "",
          },
          grid: {
            show: false,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          type: "category" as const,
          stepOfLabel: 1,
        },
      ],
      yAxis: [
        {
          line: {
            show: false,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 },
          },
          label: {
            show: true,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            suffix: "",
          },
          grid: {
            show: false,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const,
          },
          type: "category" as const,
          stepOfLabel: 1,
        },
      ],
    };

    return createChartOutput("descartes-heatmap", mergedInput, {
      map,
      fill,
      display,
      label,
      axis,
    });
  }

  // async loadSchema(): Promise<any> {
  //   const merger = new SchemaMerger();
  //   return merger.getMergedSchema("descartes-heatmap");
  // }

  validateData(data: any[][]): boolean {
    if (!Array.isArray(data) || data.length < 2) {
      return false;
    }

    // 检查标题行
    const headerRow = data[0];
    if (!Array.isArray(headerRow) || headerRow.length < 2) {
      return false;
    }

    // 检查数据行
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row) || row.length !== headerRow.length) {
        return false;
      }

      // 第一列应该是字符串，其余列应该是数字
      if (typeof row[0] !== "string") {
        return false;
      }

      for (let j = 1; j < row.length; j++) {
        if (typeof row[j] !== "number") {
          return false;
        }
      }
    }

    return true;
  }

  getChartMetadata() {
    return {
      type: "descartes-heatmap",
      name: "笛卡尔热力图",
      description: "用于展示二维数据的强度分布，通过颜色深浅表示数值大小",
      category: "热力图",
      tags: ["热力图", "二维数据", "强度分布", "颜色映射"],
      dataFormat: "cross",
      minDataPoints: 4,
      maxDataPoints: 200,
      requiredFields: ["Y轴分类", "X轴数据"],
      optionalFields: [
        "标题",
        "副标题",
        "单元格间距",
        "边框圆角",
        "渐变色",
        "标签显示",
      ],
    };
  }
}
