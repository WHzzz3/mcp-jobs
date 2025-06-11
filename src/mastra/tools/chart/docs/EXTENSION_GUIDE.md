# 扩展开发指南

本指南将帮助您扩展图表配置系统，添加新的图表类型或自定义现有功能。

## 目录

- [开发环境设置](#开发环境设置)
- [创建新图表类型](#创建新图表类型)
- [扩展现有组件](#扩展现有组件)
- [测试和验证](#测试和验证)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)
- [贡献指南](#贡献指南)

## 开发环境设置

### 前置要求

- Node.js 16.0+
- TypeScript 4.5+
- npm 或 yarn

### 安装依赖

```bash
npm install @mastra/core zod
npm install -D @types/node jest typescript
```

### 项目结构

```
src/mastra/tools/chart/
├── generators/           # 图表生成器实现
├── schemas/             # JSON Schema定义
├── interfaces/          # 类型定义
├── utils/              # 工具函数
├── registry/           # 注册表管理
├── test-framework/     # 测试框架
├── configs/            # 示例配置
├── __tests__/          # 测试文件
└── docs/               # 文档
```

## 创建新图表类型

### 第一步：定义Schema

创建新的Schema文件 `schemas/your-chart-type.schema.json`：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "allOf": [
    {"$ref": "./common.schema.json"},
    {
      "properties": {
        "data": {"$ref": "#/definitions/chartDataArray"},
        "pipe": {"const": "key_value"},
        "props": {
          "properties": {
            "type": {"const": "your-chart-type"},
            "display": {
              "properties": {
                "yourSpecificConfig": {
                  "type": "object",
                  "properties": {
                    "customProperty": {
                      "type": "string",
                      "description": "自定义属性描述"
                    },
                    "numericProperty": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 100,
                      "description": "数值属性，范围0-100"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

### 第二步：实现生成器

创建生成器文件 `generators/your-chart-type.generator.ts`：

```typescript
import { BaseChartTool } from '../interfaces/chart-tool.interface';
import { BaseChartInput, BaseChartOutput } from '../interfaces/chart-tool.interface';

export class YourChartTypeGenerator extends BaseChartTool {
  constructor() {
    super('your-chart-type', {
      theme: 'light',
      width: 800,
      height: 600,
      // 其他默认值
    });
  }

  protected getElementType(): string {
    return 'your-element-type'; // 如 'custom', 'special' 等
  }

  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    // 1. 验证输入
    this.validateInput(input);
    
    // 2. 合并默认值
    const mergedInput = this.mergeWithDefaults(input);
    
    // 3. 处理数据
    const processedData = this.processData(mergedInput.data);
    
    // 4. 处理颜色
    const colors = this.processColors(mergedInput.customColors, mergedInput.theme);
    
    // 5. 生成配置
    return {
      data: processedData,
      pipe: 'key_value' as const,
      props: {
        type: this.chartType,
        display: {
          title: mergedInput.title,
          subtitle: mergedInput.subtitle,
          theme: mergedInput.theme || 'light',
          customColors: colors,
          width: mergedInput.width || 800,
          height: mergedInput.height || 600,
          yourSpecificConfig: {
            customProperty: mergedInput.customProperty || 'default',
            numericProperty: mergedInput.numericProperty || 50,
            // 其他自定义配置
          },
          // 其他通用配置
          legend: this.buildLegendConfig(mergedInput),
          animation: this.buildAnimationConfig(mergedInput),
          tooltip: this.buildTooltipConfig(mergedInput)
        }
      }
    };
  }

  private processData(data?: any[][][]): any[][] {
    if (!data || !data[0]) {
      throw new Error('数据不能为空');
    }

    const dataset = data[0];
    
    // 验证数据格式
    if (dataset.length < 2) {
      throw new Error('数据至少需要包含标题行和一行数据');
    }

    // 处理数据转换逻辑
    // 例如：移除标题行、格式化数值等
    return dataset.slice(1).map(row => [
      String(row[0]), // 确保类别为字符串
      Number(row[1])  // 确保数值为数字
    ]);
  }

  private buildLegendConfig(input: BaseChartInput): any {
    // 构建图例配置
    return {
      show: input.showLegend !== false,
      position: input.legendPosition || 'top',
      // 其他图例配置
    };
  }

  private buildAnimationConfig(input: BaseChartInput): any {
    // 构建动画配置
    return {
      duration: input.animationDuration || 1000,
      easing: input.animationEasing || 'cubicOut'
    };
  }

  private buildTooltipConfig(input: BaseChartInput): any {
    // 构建工具提示配置
    return {
      show: input.showTooltip !== false,
      trigger: 'item'
    };
  }
}
```

### 第三步：创建示例配置

创建示例文件 `configs/your-chart-type.sample.json`：

```json
{
  "data": [[
    ["类别", "数值"],
    ["A类", 100],
    ["B类", 150],
    ["C类", 80],
    ["D类", 200]
  ]],
  "pipe": "key_value",
  "props": {
    "type": "your-chart-type",
    "display": {
      "title": "示例图表",
      "subtitle": "这是一个自定义图表类型",
      "theme": "light",
      "customColors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
      "width": 800,
      "height": 600,
      "yourSpecificConfig": {
        "customProperty": "示例值",
        "numericProperty": 75
      },
      "legend": {
        "show": true,
        "position": "top"
      },
      "animation": {
        "duration": 1000,
        "easing": "cubicOut"
      },
      "tooltip": {
        "show": true,
        "trigger": "item"
      }
    }
  }
}
```

### 第四步：添加测试

创建测试文件 `__tests__/your-chart-type.generator.test.ts`：

```typescript
import { YourChartTypeGenerator } from '../generators/your-chart-type.generator';
import { BaseChartInput } from '../interfaces/chart-tool.interface';

describe('YourChartTypeGenerator', () => {
  let generator: YourChartTypeGenerator;

  beforeEach(() => {
    generator = new YourChartTypeGenerator();
  });

  describe('基本功能', () => {
    it('应该正确生成图表配置', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值'],
          ['A', 100],
          ['B', 150]
        ]],
        title: '测试图表'
      };

      const result = await generator.generateConfig(input);

      expect(result.props.type).toBe('your-chart-type');
      expect(result.pipe).toBe('key_value');
      expect(result.data).toHaveLength(2);
      expect(result.props.display.title).toBe('测试图表');
    });

    it('应该正确处理默认值', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值'],
          ['A', 100]
        ]]
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.theme).toBe('light');
      expect(result.props.display.width).toBe(800);
      expect(result.props.display.height).toBe(600);
    });

    it('应该正确处理自定义配置', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值'],
          ['A', 100]
        ]],
        customProperty: '自定义值',
        numericProperty: 80
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.yourSpecificConfig.customProperty).toBe('自定义值');
      expect(result.props.display.yourSpecificConfig.numericProperty).toBe(80);
    });
  });

  describe('数据验证', () => {
    it('应该拒绝空数据', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: []
      };

      await expect(generator.generateConfig(input)).rejects.toThrow('数据不能为空');
    });

    it('应该拒绝无效的数据格式', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值']
          // 缺少数据行
        ]]
      };

      await expect(generator.generateConfig(input)).rejects.toThrow('数据至少需要包含标题行和一行数据');
    });
  });

  describe('配置生成', () => {
    it('应该生成正确的图例配置', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值'],
          ['A', 100]
        ]],
        showLegend: true,
        legendPosition: 'bottom'
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.legend.show).toBe(true);
      expect(result.props.display.legend.position).toBe('bottom');
    });

    it('应该生成正确的动画配置', async () => {
      const input: BaseChartInput = {
        chartType: 'your-chart-type',
        data: [[
          ['类别', '数值'],
          ['A', 100]
        ]],
        animationDuration: 2000,
        animationEasing: 'linear'
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.animation.duration).toBe(2000);
      expect(result.props.display.animation.easing).toBe('linear');
    });
  });
});
```

### 第五步：注册图表类型

在注册表中注册新的图表类型：

```typescript
import { ChartTypeRegistry } from './registry/chart-type-registry';
import { YourChartTypeGenerator } from './generators/your-chart-type.generator';
import { ChartCategory } from './registry/chart-type-registry';

// 获取注册表实例
const registry = ChartTypeRegistry.getInstance();

// 注册新图表类型
registry.register(new YourChartTypeGenerator(), {
  name: '自定义图表',
  description: '这是一个自定义图表类型的示例',
  category: ChartCategory.BASIC, // 或其他适当的分类
  dataRequirements: '二维数组：[类别, 数值]',
  examples: ['销售数据', '统计分析']
});
```

## 扩展现有组件

### 扩展BaseChartTool

如果需要为所有图表添加通用功能：

```typescript
// utils/enhanced-base-chart-tool.ts
import { BaseChartTool } from '../interfaces/chart-tool.interface';

export abstract class EnhancedBaseChartTool extends BaseChartTool {
  protected enableDataValidation = true;
  protected enablePerformanceLogging = false;

  protected validateInput(input: BaseChartInput): void {
    // 调用父类验证
    super.validateInput(input);
    
    // 添加额外验证
    if (this.enableDataValidation) {
      this.validateDataQuality(input);
    }
  }

  protected validateDataQuality(input: BaseChartInput): void {
    // 数据质量检查逻辑
    if (input.data && input.data[0]) {
      const dataset = input.data[0];
      
      // 检查数据完整性
      dataset.forEach((row, index) => {
        if (row.some(cell => cell === null || cell === undefined)) {
          console.warn(`数据行 ${index} 包含空值`);
        }
      });
    }
  }

  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    const startTime = this.enablePerformanceLogging ? Date.now() : 0;
    
    try {
      const result = await this.doGenerateConfig(input);
      
      if (this.enablePerformanceLogging) {
        console.log(`图表生成耗时: ${Date.now() - startTime}ms`);
      }
      
      return result;
    } catch (error) {
      if (this.enablePerformanceLogging) {
        console.error(`图表生成失败，耗时: ${Date.now() - startTime}ms`, error);
      }
      throw error;
    }
  }

  protected abstract doGenerateConfig(input: BaseChartInput): Promise<BaseChartOutput>;
}
```

### 扩展SchemaMerger

添加自定义Schema处理逻辑：

```typescript
// utils/enhanced-schema-merger.ts
import { SchemaMerger } from '../utils/schema-merger';

export class EnhancedSchemaMerger extends SchemaMerger {
  private customTransformations: Map<string, (schema: any) => any> = new Map();

  public registerTransformation(chartType: string, transform: (schema: any) => any): void {
    this.customTransformations.set(chartType, transform);
  }

  public mergeSchemas(chartType: string): any {
    let schema = super.mergeSchemas(chartType);
    
    // 应用自定义转换
    const transformation = this.customTransformations.get(chartType);
    if (transformation) {
      schema = transformation(schema);
    }
    
    return schema;
  }
}

// 使用示例
const merger = new EnhancedSchemaMerger();

merger.registerTransformation('your-chart-type', (schema) => {
  // 添加运行时Schema修改
  schema.properties.props.properties.display.properties.dynamicProperty = {
    type: 'string',
    description: '动态添加的属性'
  };
  return schema;
});
```

## 测试和验证

### 自动化测试

使用测试框架验证新图表类型：

```typescript
import { ChartTestFramework } from '../test-framework/chart-test-framework';

const framework = new ChartTestFramework();

// 测试新图表类型
const results = await framework.runTestsForType('your-chart-type');
console.log('测试结果:', results);
```

### 手动测试

创建测试脚本：

```typescript
// scripts/test-new-chart.ts
import { YourChartTypeGenerator } from '../generators/your-chart-type.generator';

async function testNewChart() {
  const generator = new YourChartTypeGenerator();
  
  const testData = {
    chartType: 'your-chart-type',
    data: [[
      ['类别', '数值'],
      ['测试A', 100],
      ['测试B', 150],
      ['测试C', 80]
    ]],
    title: '新图表类型测试',
    theme: 'light'
  };

  try {
    const result = await generator.generateConfig(testData);
    console.log('生成成功:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('生成失败:', error);
  }
}

testNewChart();
```

### 集成测试

验证与现有系统的集成：

```typescript
import { createChartTool } from '../utils/chart-tool-factory';
import { YourChartTypeGenerator } from '../generators/your-chart-type.generator';

// 创建Mastra工具
const chartTool = createChartTool({
  chartTool: new YourChartTypeGenerator()
});

// 测试工具执行
const result = await chartTool.execute({
  chartType: 'your-chart-type',
  data: [/* 测试数据 */],
  title: '集成测试'
});

console.log('工具执行结果:', result);
```

## 性能优化

### 缓存策略

实现智能缓存：

```typescript
export class CachedChartGenerator extends BaseChartTool {
  private configCache = new Map<string, BaseChartOutput>();
  private maxCacheSize = 100;

  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    const cacheKey = this.getCacheKey(input);
    
    // 检查缓存
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }
    
    // 生成配置
    const result = await super.generateConfig(input);
    
    // 存入缓存
    this.setCacheEntry(cacheKey, result);
    
    return result;
  }

  private getCacheKey(input: BaseChartInput): string {
    return JSON.stringify({
      chartType: input.chartType,
      dataHash: this.hashData(input.data),
      theme: input.theme,
      // 其他关键属性
    });
  }

  private hashData(data?: any[][][]): string {
    if (!data) return '';
    return JSON.stringify(data).slice(0, 100); // 简单哈希
  }

  private setCacheEntry(key: string, value: BaseChartOutput): void {
    // 清理过期缓存
    if (this.configCache.size >= this.maxCacheSize) {
      const firstKey = this.configCache.keys().next().value;
      this.configCache.delete(firstKey);
    }
    
    this.configCache.set(key, value);
  }
}
```

### 懒加载

实现组件懒加载：

```typescript
export class LazyChartRegistry {
  private generators = new Map<string, () => Promise<BaseChartTool>>();
  private instances = new Map<string, BaseChartTool>();

  public registerLazy(chartType: string, loader: () => Promise<BaseChartTool>): void {
    this.generators.set(chartType, loader);
  }

  public async getTool(chartType: string): Promise<BaseChartTool | undefined> {
    // 检查已实例化的工具
    if (this.instances.has(chartType)) {
      return this.instances.get(chartType);
    }

    // 懒加载工具
    const loader = this.generators.get(chartType);
    if (loader) {
      const instance = await loader();
      this.instances.set(chartType, instance);
      return instance;
    }

    return undefined;
  }
}

// 使用示例
const registry = new LazyChartRegistry();

registry.registerLazy('your-chart-type', async () => {
  const { YourChartTypeGenerator } = await import('../generators/your-chart-type.generator');
  return new YourChartTypeGenerator();
});
```

## 最佳实践

### 1. 代码组织

- **单一职责**: 每个生成器只负责一种图表类型
- **清晰命名**: 使用描述性的类名和方法名
- **模块化**: 将复杂逻辑拆分为独立的方法

### 2. 错误处理

```typescript
export class RobustChartGenerator extends BaseChartTool {
  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    try {
      this.validateInput(input);
      return await this.doGenerateConfig(input);
    } catch (error) {
      // 记录详细错误信息
      console.error(`图表生成失败 [${this.chartType}]:`, {
        error: error.message,
        input: this.sanitizeInput(input),
        timestamp: new Date().toISOString()
      });
      
      // 抛出包装后的错误
      throw new ChartGenerationError(
        `Failed to generate ${this.chartType} chart: ${error.message}`,
        this.chartType,
        error
      );
    }
  }

  private sanitizeInput(input: BaseChartInput): any {
    // 移除敏感信息
    const sanitized = { ...input };
    delete sanitized.data; // 避免记录大量数据
    return sanitized;
  }
}

export class ChartGenerationError extends Error {
  constructor(
    message: string,
    public chartType: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'ChartGenerationError';
  }
}
```

### 3. 类型安全

```typescript
// 定义严格的类型接口
export interface YourChartInput extends BaseChartInput {
  chartType: 'your-chart-type';
  customProperty?: string;
  numericProperty?: number;
}

export interface YourChartOutput extends BaseChartOutput {
  props: {
    type: 'your-chart-type';
    display: {
      yourSpecificConfig: {
        customProperty: string;
        numericProperty: number;
      };
    } & BaseChartOutput['props']['display'];
  };
}

export class YourChartTypeGenerator extends BaseChartTool {
  public async generateConfig(input: YourChartInput): Promise<YourChartOutput> {
    // 实现具有完整类型安全的生成逻辑
  }
}
```

### 4. 文档化

为新组件添加完整的JSDoc注释：

```typescript
/**
 * 自定义图表类型生成器
 * 
 * @example
 * ```typescript
 * const generator = new YourChartTypeGenerator();
 * const config = await generator.generateConfig({
 *   chartType: 'your-chart-type',
 *   data: [[['A', 100], ['B', 200]]],
 *   customProperty: 'value'
 * });
 * ```
 */
export class YourChartTypeGenerator extends BaseChartTool {
  /**
   * 生成图表配置
   * 
   * @param input - 输入配置
   * @returns 生成的图表配置
   * @throws {ChartValidationError} 当输入数据无效时
   */
  public async generateConfig(input: YourChartInput): Promise<YourChartOutput> {
    // 实现...
  }
}
```

## 贡献指南

### 提交新图表类型

1. **Fork项目**
2. **创建功能分支**: `git checkout -b feature/new-chart-type`
3. **实现功能**: 按照本指南完成开发
4. **添加测试**: 确保100%测试覆盖率
5. **更新文档**: 添加使用示例和API文档
6. **提交代码**: `git commit -am 'Add new chart type'`
7. **创建PR**: 详细描述新功能

### 代码审查清单

- [ ] 遵循现有代码风格
- [ ] 包含完整的单元测试
- [ ] Schema定义正确
- [ ] 示例配置有效
- [ ] 性能测试通过
- [ ] 文档完整准确
- [ ] 向后兼容

### 发布流程

1. **版本号**: 遵循语义化版本控制
2. **变更日志**: 记录所有重要变更
3. **向后兼容**: 确保不破坏现有功能
4. **测试验证**: 通过所有自动化测试

---

*扩展开发指南会随着系统演进而持续更新。如有疑问，请查看示例代码或联系维护团队。* 