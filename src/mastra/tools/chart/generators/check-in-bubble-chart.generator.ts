import { z } from 'zod';
import { BaseChartTool, BaseChartInput, BaseChartOutput, BaseChartInputSchema } from '../interfaces/chart-tool.interface';
import { SchemaMerger } from '../utils/schema-merger';
import { 
  generateDefaultTitle, 
  generateDefaultBackground, 
  generateDefaultLegend,
  getThemeColors,
  createChartOutput 
} from '../utils/chart-helpers';

// 签到气泡图特定输入接口
export interface CheckInBubbleChartInput extends BaseChartInput {
  data: Array<Array<string | number>>; // 三列数据格式: [X轴分类, Y轴分类, 气泡大小值]
  colors?: string[];
  bubbleSize?: {
    min?: number;
    max?: number;
  };
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  showLabels?: boolean;
}

// 签到气泡图特定输出接口  
export interface CheckInBubbleChartOutput extends BaseChartOutput {
  props: {
    type: 'check-in-bubble';
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
        sizeMultiplier: number;
        minSize: number;
        maxSize: number;
        opacity: number;
        border: {
          type: string;
          width: number;
          color: any;
        };
      };
    };
    legend: any;
    label: any;
    axis: any;
  };
}

// Zod验证schema，扩展基础schema
export const CheckInBubbleChartInputSchema = BaseChartInputSchema.extend({
  data: z.array(z.array(z.union([z.string(), z.number()]))).min(2, "Data must have at least 2 rows (header and data)"),
  colors: z.array(z.string()).optional(),
  bubbleSize: z.object({
    min: z.number().positive().optional().default(5),
    max: z.number().positive().optional().default(50),
  }).optional(),
  opacity: z.number().min(0).max(1).optional().default(0.8),
  borderWidth: z.number().min(0).optional().default(1),
  borderColor: z.string().optional().default('#ffffff'),
  showLabels: z.boolean().optional().default(false),
});

export class CheckInBubbleChartGenerator extends BaseChartTool {
  constructor() {
    super('check-in-bubble');
  }

  protected getElementType(): string {
    return 'bar'; // 气泡图在schema中使用bar类型
  }

  async generateConfig(input: CheckInBubbleChartInput): Promise<CheckInBubbleChartOutput> {
    // 验证输入
    const validatedInput = CheckInBubbleChartInputSchema.parse(input);
    const inputWithChartType = { ...validatedInput, chartType: 'check-in-bubble' };
    const mergedInput = this.mergeWithDefaults(inputWithChartType);
    
    // 获取数据维度
    const dataRows = validatedInput.data.length;
    const dataCols = validatedInput.data[0]?.length || 0;
    
    if (dataCols !== 3) {
      throw new Error('签到气泡图需要恰好3列数据（X轴分类、Y轴分类、气泡大小值）');
    }

    // 获取数据项数量用于颜色分配
    const itemCount = dataRows - 1; // 减去header行
    
    // 获取默认配置
    const themeColors = getThemeColors(mergedInput.theme || 'light', itemCount);
    const colors = validatedInput.colors || themeColors.map((c: any) => c.color);

    // 构建数据映射 - 气泡图的特定映射
    const map: Array<{
      name: string;
      index: number;
      isLegend: boolean;
      function: string;
      configurable: boolean;
      xAxisIndex?: number;
      yAxisIndex?: number;
      type: string;
    }> = [
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
        name: "Y轴对象",
        index: 1,
        isLegend: false,
        function: "objCol",
        configurable: true,
        yAxisIndex: 0,
        type: ""
      },
      {
        name: "气泡大小值",
        index: 2,
        isLegend: false,
        function: "vCol",
        configurable: true,
        type: "bar"
      }
    ];

    // 构建填充配置
    const fill = {
      controlType: "multiple" as const,
      props: colors.slice(0, itemCount).map((color: string) => ({
        color: { color: color, opacity: validatedInput.opacity || 0.8 },
        shadow: {
          show: false,
          type: "outer" as const,
          angle: 45,
          blur: 3,
          color: { color: "#000000", opacity: 0.2 },
          radius: 2
        },
        border: {
          type: "solid" as const,
          width: validatedInput.borderWidth || 1,
          color: validatedInput.borderColor ? 
            { color: validatedInput.borderColor, opacity: 1 } : 
            null
        }
      }))
    };

    // 构建显示配置
    const bubbleConfig = validatedInput.bubbleSize || { min: 5, max: 50 };
    const display = {
      bar: {
        sizeMultiplier: 1,
        minSize: bubbleConfig.min || 5,
        maxSize: bubbleConfig.max || 50,
        opacity: validatedInput.opacity || 0.8,
        border: {
          type: "solid" as const,
          width: validatedInput.borderWidth || 1,
          color: validatedInput.borderColor ? 
            { color: validatedInput.borderColor, opacity: 1 } : 
            null
        }
      }
    };

    // 构建标签配置
    const label = {
      show: validatedInput.showLabels || false,
      bubbleLabel: {
        show: validatedInput.showLabels || false,
        fontFamily: "Misans 常规",
        fontSize: 12,
        color: { color: "#333333", opacity: 1 },
        position: "center" as const
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
            color: { color: "#000000", opacity: 1 }
          },
          label: {
            show: true,
            direction: "auto" as const,
            fontFamily: "Misans 常规",
            fontSize: 12,
            color: { color: "#000000", opacity: 1 },
            angle: 0
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#cccccc", opacity: 1 },
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
            color: { color: "#000000", opacity: 1 }
          },
          label: {
            show: true,
            fontFamily: "Misans 常规",
            fontSize: 12,
            color: { color: "#000000", opacity: 1 },
            angle: 0,
            suffix: ""
          },
          grid: {
            show: true,
            width: 1,
            color: { color: "#cccccc", opacity: 1 },
            type: "solid" as const
          },
          position: "left" as const,
          type: "category" as const
        }
      ]
    };

    // 生成图表配置
    const result = createChartOutput(
      'check-in-bubble',
      mergedInput,
      {
        map,
        fill,
        display,
        label,
        axis,
      }
    );

    return result as CheckInBubbleChartOutput;
  }

  getInputSchema() {
    return CheckInBubbleChartInputSchema;
  }

  getOutputSchema() {
    return z.object({
      data: z.array(z.any()),
      pipe: z.string(),
      props: z.object({
        type: z.literal('check-in-bubble'),
        title: z.any(),
        background: z.any(),
        map: z.array(z.any()),
        fill: z.any(),
        display: z.any(),
        legend: z.any(),
        label: z.any(),
        axis: z.any(),
      }),
    });
  }

  async loadSchema(): Promise<any> {
    const merger = new SchemaMerger();
    return await merger.mergeSchemas('check-in-bubble.schema.json');
  }
} 