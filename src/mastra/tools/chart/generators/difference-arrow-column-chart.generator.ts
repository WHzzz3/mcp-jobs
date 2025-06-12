import { z } from 'zod';
import { BaseChartTool, BaseChartInput, BaseChartOutput } from '../interfaces/chart-tool.interface';
import { SchemaMerger } from '../utils/schema-merger';
import { 
  generateDefaultTitle, 
  generateDefaultBackground, 
  generateDefaultLegend,
  getThemeColors
} from '../utils/chart-helpers';

// 差异箭头柱状图特定输入接口
export interface DifferenceArrowColumnChartInput extends BaseChartInput {
  data: Array<Array<(string | number)[]>>; // 兼容表格格式数据
  title?: string;
  subtitle?: string;
  showLabels?: boolean;
  showArrowLabels?: boolean;
  colors?: string[];
  barWidth?: number; // 柱体宽度百分比 (0-1)
  arrowColors?: {
    growth?: string; // 增长箭头颜色
    decrease?: string; // 下降箭头颜色
  };
  chartType: 'difference-arrow-column';
}

// 差异箭头柱状图特定输出接口
export interface DifferenceArrowColumnChartOutput extends BaseChartOutput {
  props: {
    type: 'difference-arrow-column';
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
      arrow: {
        growthArrowColor: any;
        decreaseArrowColor: any;
        width: number;
        endLine: any;
      };
    };
    legend: any;
    label: any;
    axis: any;
  };
}

// Zod验证schema
export const DifferenceArrowColumnChartInputSchema = z.object({
  data: z.array(z.array(z.array(z.union([z.string(), z.number()])))).min(1),
  title: z.string().optional().default('差异箭头柱状图'),
  subtitle: z.string().optional().default('副标题'),
  showLabels: z.boolean().optional().default(false),
  showArrowLabels: z.boolean().optional().default(false),
  colors: z.array(z.string()).optional(),
  barWidth: z.number().min(0.1).max(1).optional().default(0.7),
  arrowColors: z.object({
    growth: z.string().optional().default('#62D9AD'),
    decrease: z.string().optional().default('#E65A56'),
  }).optional().default({}),
  chartType: z.literal('difference-arrow-column'),
});

export class DifferenceArrowColumnChartGenerator extends BaseChartTool {
  constructor() {
    super('difference-arrow-column');
  }

  protected getElementType(): string {
    return 'bar';
  }

  async generateConfig(input: DifferenceArrowColumnChartInput): Promise<DifferenceArrowColumnChartOutput> {
    // 验证输入
    const validatedInput = DifferenceArrowColumnChartInputSchema.parse(input);
    const inputWithChartType = { ...validatedInput, chartType: 'difference-arrow-column' };
    const mergedInput = this.mergeWithDefaults(inputWithChartType);
    
    // 获取默认配置
    const themeColors = getThemeColors(mergedInput.theme || 'light', 2);
    const colors = validatedInput.colors || ['#5AAEF3', '#62D9AD'];
    const arrowColors = {
      growth: validatedInput.arrowColors?.growth || '#62D9AD',
      decrease: validatedInput.arrowColors?.decrease || '#E65A56',
    };
    
    // 构建数据映射
    const map = [
      {
        name: "X轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      },
      {
        name: "基数",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "bar"
      },
      {
        name: "对比数",
        index: 2,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "bar"
      }
    ];

    // 构建填充配置
    const fill = {
      controlType: "multiple" as const,
      props: colors.map((color: string) => ({
        color: { color: color, opacity: 1 },
        texture: { url: "" },
        shadow: {
          show: false,
          type: "outer" as const,
          angle: 45,
          blur: 0,
          color: { color: "#000000", opacity: 0.5 },
          radius: 0
        },
        border: {
          type: "solid" as const,
          width: 0,
          color: null
        }
      }))
    };

    // 构建显示配置（包含箭头配置）
    const display = {
      bar: {
        widthPercent: validatedInput.barWidth || 0.7,
        border: {
          radius: [0, 0, 0, 0],
          type: "solid" as const,
          width: 0,
          color: null
        }
      },
      arrow: {
        growthArrowColor: { color: arrowColors.growth, opacity: 1 },
        decreaseArrowColor: { color: arrowColors.decrease, opacity: 1 },
        width: 2,
        endLine: {
          type: "solid" as const,
          width: 2,
          color: { color: "#333333", opacity: 1 }
        }
      }
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
        suffix: ""
      },
      arrowLabel: {
        show: validatedInput.showArrowLabels || false,
        fontFamily: "Misans 常规",
        fontSize: 12,
        color: { color: "#333333", opacity: 1 }
      },
      highlight: false,
      overlap: false
    };

    // 构建坐标轴配置
    const axis = {
      show: true,
      xAxis: [
        {
          line: {
            show: true,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 }
          },
          label: {
            show: true,
            direction: "auto" as const,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            angle: 0
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const
          },
          position: "bottom" as const,
          type: "category" as const
        }
      ],
      yAxis: [
        {
          line: {
            show: true,
            width: 1,
            color: { color: "#4D4D4D", opacity: 1 }
          },
          label: {
            show: true,
            fontFamily: "Misans 常规",
            fontSize: 14,
            color: { color: "#000000", opacity: 1 },
            angle: 0,
            suffix: ""
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#D9D9D9", opacity: 1 },
            type: "solid" as const
          },
          position: "left" as const,
          type: "value" as const,
          max: "auto" as const,
          min: "auto" as const
        }
      ]
    };

    return {
      data: validatedInput.data,
      pipe: "key_value",
      props: {
        type: 'difference-arrow-column',
        title: generateDefaultTitle(validatedInput.title, validatedInput.subtitle),
        background: generateDefaultBackground(),
        map,
        fill,
        display,
        legend: generateDefaultLegend(),
        label,
        axis,
      }
    };
  }

  getInputSchema(): z.ZodType<DifferenceArrowColumnChartInput> {
    return DifferenceArrowColumnChartInputSchema;
  }

  getOutputSchema(): z.ZodType<DifferenceArrowColumnChartOutput> {
    return z.any(); // 可以根据需要进一步细化
  }

  async loadSchema(): Promise<any> {
    const schemaMerger = new SchemaMerger();
    return schemaMerger.getMergedSchema('difference-arrow-column');
  }
} 