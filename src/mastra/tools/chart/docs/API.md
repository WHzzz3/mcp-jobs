# API 参考文档

## 目录

- [BaseChartTool](#basechart-tool)
- [工厂函数](#工厂函数)
- [Schema合并器](#schema合并器)
- [图表类型注册表](#图表类型注册表)
- [测试框架](#测试框架)
- [示例加载器](#示例加载器)
- [接口定义](#接口定义)

## BaseChartTool

所有图表生成器的抽象基类。

### 构造函数

```typescript
protected constructor(
  chartType: string,
  defaultValues?: Partial<BaseChartInput>
)
```

**参数:**
- `chartType` - 图表类型标识符
- `defaultValues` - 可选的默认配置值

### 抽象方法

#### generateConfig

```typescript
public abstract generateConfig(input: BaseChartInput): Promise<BaseChartOutput>
```

生成图表配置的主要方法。

**参数:**
- `input` - 输入配置对象

**返回值:**
- `Promise<BaseChartOutput>` - 生成的图表配置

#### getElementType

```typescript
protected abstract getElementType(): string
```

返回图表元素类型（如 'column', 'bar', 'pie' 等）。

### 保护方法

#### validateInput

```typescript
protected validateInput(input: BaseChartInput): void
```

验证输入数据格式。

#### mergeWithDefaults

```typescript
protected mergeWithDefaults(input: BaseChartInput): BaseChartInput
```

将输入与默认值合并。

#### processColors

```typescript
protected processColors(
  customColors?: string[],
  theme?: string
): string[]
```

处理颜色配置，支持自定义颜色和主题。

### 示例实现

```typescript
export class BasicColumnChartGenerator extends BaseChartTool {
  constructor() {
    super('basic-column', {
      theme: 'light',
      width: 800,
      height: 600
    });
  }

  protected getElementType(): string {
    return 'column';
  }

  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    this.validateInput(input);
    const mergedInput = this.mergeWithDefaults(input);
    
    return {
      data: mergedInput.data || [],
      pipe: 'key_value' as const,
      props: {
        type: this.chartType,
        display: {
          title: mergedInput.title,
          subtitle: mergedInput.subtitle,
          theme: mergedInput.theme || 'light',
          // 其他配置...
        }
      }
    };
  }
}
```

## 工厂函数

### createChartTool

创建单个图表工具。

```typescript
export function createChartTool(options: ChartToolOptions): ToolApi<any, any>
```

**参数:**
```typescript
interface ChartToolOptions {
  chartTool: BaseChartTool;
  inputSchema?: any;
  outputSchema?: any;
}
```

**示例:**
```typescript
const tool = createChartTool({
  chartTool: new BasicColumnChartGenerator(),
  inputSchema: customInputSchema,
  outputSchema: customOutputSchema
});
```

### createChartTools

批量创建图表工具。

```typescript
export function createChartTools(
  generators: BaseChartTool[]
): ToolApi<any, any>[]
```

**示例:**
```typescript
const tools = createChartTools([
  new BasicColumnChartGenerator(),
  new BasicBarChartGenerator(),
  new BasicPieChartGenerator()
]);
```

## Schema合并器

### SchemaMerger类

负责合并公共Schema与图表特定Schema。

```typescript
export class SchemaMerger {
  constructor(
    private commonSchemaPath: string = './schemas/common.schema.json',
    private schemasDir: string = './schemas'
  )
  
  // 获取缓存的合并Schema
  public getCachedMergedSchema(chartType: string): any | null
  
  // 合并指定图表类型的Schema
  public mergeSchemas(chartType: string): any
  
  // 清除所有缓存
  public clearCache(): void
  
  // 获取缓存统计信息
  public getCacheStats(): CacheStats
}
```

**示例:**
```typescript
const merger = new SchemaMerger();

// 获取合并后的Schema
const schema = merger.mergeSchemas('basic-column');

// 检查缓存状态
const stats = merger.getCacheStats();
console.log(`缓存命中: ${stats.hits}, 未命中: ${stats.misses}`);
```

## 图表类型注册表

### ChartTypeRegistry类

单例模式的图表类型管理器。

```typescript
export class ChartTypeRegistry {
  // 获取单例实例
  public static getInstance(): ChartTypeRegistry
  
  // 注册图表类型
  public register(
    generator: BaseChartTool,
    metadata: ChartTypeMetadata
  ): void
  
  // 获取图表工具
  public getTool(chartType: string): BaseChartTool | undefined
  
  // 获取所有已注册类型
  public getRegisteredTypes(): string[]
  
  // 按类别获取类型
  public getTypesByCategory(category: ChartCategory): string[]
  
  // 获取类型元数据
  public getMetadata(chartType: string): ChartTypeMetadata | undefined
  
  // 检查类型是否已注册
  public isRegistered(chartType: string): boolean
  
  // 清除所有注册
  public clear(): void
}
```

**接口定义:**
```typescript
interface ChartTypeMetadata {
  name: string;
  description: string;
  category: ChartCategory;
  dataRequirements?: string;
  examples?: string[];
}

enum ChartCategory {
  BASIC = 'basic',
  PROGRESS = 'progress',
  STACKED = 'stacked',
  COMPLEX = 'complex',
  MIXED = 'mixed'
}
```

**示例:**
```typescript
const registry = ChartTypeRegistry.getInstance();

// 注册图表类型
registry.register(new BasicColumnChartGenerator(), {
  name: '基础柱状图',
  description: '显示分类数据的柱状图表',
  category: ChartCategory.BASIC,
  dataRequirements: '二维数组：[类别, 数值]',
  examples: ['销售数据', '用户统计']
});

// 获取工具
const tool = registry.getTool('basic-column');

// 获取分类
const basicCharts = registry.getTypesByCategory(ChartCategory.BASIC);
```

## 测试框架

### ChartTestFramework类

自动化测试框架。

```typescript
export class ChartTestFramework {
  constructor(private configsDir: string = './configs')
  
  // 运行所有测试
  public async runAllTests(): Promise<TestReport>
  
  // 运行特定类型测试
  public async runTestsForType(chartType: string): Promise<TestResult[]>
  
  // 运行批量测试
  public async runBatchTests(chartTypes: string[]): Promise<TestReport>
  
  // 验证单个配置
  public async validateConfig(
    chartType: string,
    config: any
  ): Promise<ValidationResult>
}
```

**类型定义:**
```typescript
interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    duration: number;
  };
  results: TestResult[];
  errors: string[];
}

interface TestResult {
  chartType: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: {
    inputValid: boolean;
    outputValid: boolean;
    configGenerated: boolean;
  };
}
```

### TestRunner类

测试运行器，支持HTML和JSON报告生成。

```typescript
export class TestRunner {
  // 运行测试并生成报告
  public async runAndGenerateReports(
    outputDir: string = './test-reports'
  ): Promise<void>
  
  // 生成HTML报告
  public generateHTMLReport(report: TestReport): string
  
  // 生成JSON报告
  public generateJSONReport(report: TestReport): string
}
```

### TestCoverageReporter类

测试覆盖率分析和报告。

```typescript
export class TestCoverageReporter {
  constructor(
    private baseDir: string = '.',
    private generatorsDir: string = './generators',
    private testsDir: string = './__tests__'
  )
  
  // 生成覆盖率报告
  public async generateCoverageReport(): Promise<CoverageReport>
  
  // 生成HTML报告
  public generateHTMLReport(report: CoverageReport): string
  
  // 控制台输出报告
  public printConsoleReport(report: CoverageReport): void
  
  // 获取改进建议
  public getImprovementSuggestions(report: CoverageReport): string[]
}
```

## 示例加载器

### SampleJsonLoader类

示例配置文件加载器。

```typescript
export class SampleJsonLoader {
  constructor(
    private configsDir: string = './configs',
    private enableCache: boolean = true
  )
  
  // 按图表类型加载示例
  public loadByChartType(chartType: string): ChartConfig | null
  
  // 加载所有示例
  public loadAllSamples(): Map<string, ChartConfig>
  
  // 按类别加载示例
  public loadByCategory(category: string): Map<string, ChartConfig>
  
  // 获取可用的图表类型
  public getAvailableTypes(): string[]
  
  // 扫描配置目录
  public scanConfigDirectory(): ScanResult
  
  // 清除缓存
  public clearCache(): void
  
  // 获取缓存状态
  public getCacheInfo(): CacheInfo
}
```

**示例:**
```typescript
const loader = new SampleJsonLoader('./configs');

// 加载特定类型
const columnConfig = loader.loadByChartType('basic-column');

// 加载所有示例
const allSamples = loader.loadAllSamples();

// 获取统计信息
const scanResult = loader.scanConfigDirectory();
console.log(`找到 ${scanResult.totalFiles} 个配置文件`);
```

## 接口定义

### 核心接口

```typescript
// 基础输入接口
interface BaseChartInput {
  chartType: string;
  data?: any[][][];
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  customColors?: string[];
  width?: number;
  height?: number;
  [key: string]: any;
}

// 基础输出接口
interface BaseChartOutput {
  data: any[][];
  pipe: 'key_value' | 'cross';
  props: {
    type: string;
    display?: {
      title?: string;
      subtitle?: string;
      theme?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// 图表配置接口
interface ChartConfig {
  data: any[][];
  pipe: string;
  props: {
    type: string;
    display?: any;
    [key: string]: any;
  };
}
```

### 工具接口

```typescript
// 图表工具接口
interface IChartTool {
  generateConfig(input: BaseChartInput): Promise<BaseChartOutput>;
  getChartType(): string;
  validateInput(input: BaseChartInput): boolean;
}

// Mastra工具API接口
interface ToolApi<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
  schema: {
    input: any;
    output: any;
  };
}
```

### 错误处理

```typescript
// 自定义错误类
export class ChartValidationError extends Error {
  constructor(
    message: string,
    public chartType: string,
    public validationErrors: string[]
  ) {
    super(message);
    this.name = 'ChartValidationError';
  }
}

export class SchemaLoadError extends Error {
  constructor(
    message: string,
    public schemaPath: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SchemaLoadError';
  }
}
```

## 使用模式

### 基本使用模式

```typescript
// 1. 创建生成器
const generator = new BasicColumnChartGenerator();

// 2. 准备数据
const input: BaseChartInput = {
  chartType: 'basic-column',
  data: [[
    ['产品A', 100],
    ['产品B', 150],
    ['产品C', 80]
  ]],
  title: '销售数据',
  theme: 'light'
};

// 3. 生成配置
const config = await generator.generateConfig(input);
```

### 工厂模式

```typescript
// 1. 创建工具
const tool = createChartTool({
  chartTool: new BasicColumnChartGenerator()
});

// 2. 执行工具
const result = await tool.execute(input);
```

### 注册表模式

```typescript
// 1. 获取注册表
const registry = ChartTypeRegistry.getInstance();

// 2. 获取工具
const tool = registry.getTool('basic-column');

// 3. 使用工具
const config = await tool?.generateConfig(input);
```

### 测试模式

```typescript
// 1. 创建测试框架
const framework = new ChartTestFramework();

// 2. 运行测试
const report = await framework.runAllTests();

// 3. 分析结果
console.log(`测试通过率: ${report.summary.successRate}%`);
```

## 性能优化

### 缓存策略

1. **Schema缓存**: SchemaMerger自动缓存合并后的Schema
2. **示例缓存**: SampleJsonLoader可选择启用文件缓存
3. **注册表缓存**: ChartTypeRegistry缓存已注册的工具实例

### 批量操作

```typescript
// 批量测试
const batchResults = await framework.runBatchTests([
  'basic-column',
  'basic-bar',
  'basic-pie'
]);

// 批量创建工具
const tools = createChartTools([
  new BasicColumnChartGenerator(),
  new BasicBarChartGenerator()
]);
```

### 内存管理

```typescript
// 清除缓存
schemaMerger.clearCache();
sampleLoader.clearCache();
registry.clear();
```

## 错误处理最佳实践

```typescript
try {
  const config = await generator.generateConfig(input);
} catch (error) {
  if (error instanceof ChartValidationError) {
    console.error('验证错误:', error.validationErrors);
  } else if (error instanceof SchemaLoadError) {
    console.error('Schema加载错误:', error.schemaPath);
  } else {
    console.error('未知错误:', error.message);
  }
}
```

---

*API参考文档会随着系统更新而持续维护。* 