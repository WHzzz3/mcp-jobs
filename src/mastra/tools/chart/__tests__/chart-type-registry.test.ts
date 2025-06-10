import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartTypeRegistry, ChartCategory, ChartTypeRegistryError } from '../registry/chart-type-registry';
import { ChartLoader, createDefaultChartLoader } from '../registry/chart-loader';
import { BasicBarChartGenerator } from '../generators/basic-bar-chart.generator';
import { BasicPieChartGenerator } from '../generators/basic-pie-chart.generator';
import { BarProgressChartGenerator } from '../generators/bar-progress-chart.generator';
import { BaseChartTool } from '../interfaces/chart-tool.interface';

// Mock 生成器用于测试
class MockChartGenerator extends BaseChartTool {
  constructor(chartType: string) {
    super(chartType);
  }

  protected getElementType(): string {
    return 'mock';
  }

  async generateConfig(input: any): Promise<any> {
    return {
      data: input.data || [],
      pipe: 'cross',
      props: {
        type: this.getChartType(),
        title: { text: 'Mock Chart' },
        background: { color: '#ffffff' }
      }
    };
  }

  async loadSchema(): Promise<any> {
    return {
      type: 'object',
      properties: {
        data: { type: 'array' },
        pipe: { type: 'string', default: 'cross' }
      }
    };
  }
}

describe('Chart Type Registry Tests', () => {
  let registry: ChartTypeRegistry;
  let mockBarGenerator: BaseChartTool;
  let mockPieGenerator: BaseChartTool;
  let mockProgressGenerator: BaseChartTool;

  beforeEach(() => {
    // 重置注册表
    ChartTypeRegistry.reset();
    registry = ChartTypeRegistry.getInstance();

    // 创建测试用的生成器
    mockBarGenerator = new MockChartGenerator('test-bar');
    mockPieGenerator = new MockChartGenerator('test-pie');
    mockProgressGenerator = new MockChartGenerator('test-progress');
  });

  afterEach(() => {
    // 清理
    registry.clear();
  });

  describe('Registry Initialization', () => {
    it('应该创建单例实例', () => {
      const instance1 = ChartTypeRegistry.getInstance();
      const instance2 = ChartTypeRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('应该支持配置选项', () => {
      ChartTypeRegistry.reset();
      const configuredRegistry = ChartTypeRegistry.getInstance({
        strictMode: false,
        maxRegistrations: 10,
        defaultCategory: ChartCategory.COMPLEX
      });
      
      expect(configuredRegistry).toBeDefined();
    });

    it('应该正确初始化分类映射', () => {
      const stats = registry.getStats();
      expect(stats.categoryCounts).toBeDefined();
      expect(Object.keys(stats.categoryCounts)).toContain('basic');
      expect(Object.keys(stats.categoryCounts)).toContain('progress');
    });
  });

  describe('Chart Type Registration', () => {
    it('应该成功注册新的图表类型', () => {
      registry.register(mockBarGenerator, {
        name: 'Test Bar Chart',
        description: 'A test bar chart',
        category: ChartCategory.BASIC
      });

      expect(registry.has('test-bar')).toBe(true);
      expect(registry.getTool('test-bar')).toBe(mockBarGenerator);
    });

    it('应该自动生成显示名称和描述', () => {
      registry.register(mockBarGenerator);
      
      const info = registry.get('test-bar');
      expect(info?.name).toBe('Test Bar');
      expect(info?.description).toContain('test-bar');
    });

    it('应该在严格模式下拒绝重复注册', () => {
      registry.register(mockBarGenerator);
      
      expect(() => {
        registry.register(mockBarGenerator);
      }).toThrow(ChartTypeRegistryError);
    });

    it('应该支持批量注册', () => {
      const registrations = [
        { tool: mockBarGenerator, options: { category: ChartCategory.BASIC } },
        { tool: mockPieGenerator, options: { category: ChartCategory.BASIC } },
        { tool: mockProgressGenerator, options: { category: ChartCategory.PROGRESS } }
      ];

      registry.registerBatch(registrations);

      expect(registry.getRegisteredTypes()).toHaveLength(3);
      expect(registry.has('test-bar')).toBe(true);
      expect(registry.has('test-pie')).toBe(true);
      expect(registry.has('test-progress')).toBe(true);
    });

    it('应该正确检测多系列支持', () => {
      const stackedGenerator = new MockChartGenerator('test-stacked-bar');
      registry.register(stackedGenerator);

      const info = registry.get('test-stacked-bar');
      expect(info?.supportsMultiSeries).toBe(true);
    });

    it('应该正确检测支持的管道类型', () => {
      registry.register(mockProgressGenerator);

      const info = registry.get('test-progress');
      expect(info?.supportedPipeTypes).toContain('key_value');
    });
  });

  describe('Chart Type Management', () => {
    beforeEach(() => {
      registry.register(mockBarGenerator, { category: ChartCategory.BASIC });
      registry.register(mockPieGenerator, { category: ChartCategory.BASIC });
      registry.register(mockProgressGenerator, { category: ChartCategory.PROGRESS });
    });

    it('应该能够注销图表类型', () => {
      expect(registry.unregister('test-bar')).toBe(true);
      expect(registry.has('test-bar')).toBe(false);
      expect(registry.unregister('nonexistent')).toBe(false);
    });

    it('应该能够更新图表类型信息', () => {
      const updated = registry.update('test-bar', {
        name: 'Updated Bar Chart',
        description: 'An updated description'
      });

      expect(updated).toBe(true);
      const info = registry.get('test-bar');
      expect(info?.name).toBe('Updated Bar Chart');
      expect(info?.description).toBe('An updated description');
    });

    it('应该能够按分类获取图表类型', () => {
      const basicTypes = registry.getTypesByCategory(ChartCategory.BASIC);
      const progressTypes = registry.getTypesByCategory(ChartCategory.PROGRESS);

      expect(basicTypes).toContain('test-bar');
      expect(basicTypes).toContain('test-pie');
      expect(progressTypes).toContain('test-progress');
    });

    it('应该能够按管道类型筛选图表', () => {
      const crossTypes = registry.getTypesByPipeType('cross');
      const keyValueTypes = registry.getTypesByPipeType('key_value');

      expect(crossTypes.length).toBeGreaterThan(0);
      expect(keyValueTypes).toContain('test-progress');
    });

    it('应该能够获取统计信息', () => {
      const stats = registry.getStats();

      expect(stats.totalRegistered).toBe(3);
      expect(stats.categoryCounts.basic).toBe(2);
      expect(stats.categoryCounts.progress).toBe(1);
    });
  });

  describe('Mastra Tool Creation', () => {
    beforeEach(() => {
      registry.register(mockBarGenerator, { category: ChartCategory.BASIC });
      registry.register(mockPieGenerator, { category: ChartCategory.BASIC });
    });

    it('应该能够创建单个Mastra工具', () => {
      const tool = registry.createMastraTool('test-bar');
      expect(tool).toBeDefined();
      expect(tool.id).toBe('generate-test-bar');
    });

    it('应该能够创建所有Mastra工具', () => {
      const tools = registry.createAllMastraTools();
      expect(Object.keys(tools)).toHaveLength(2);
    });

    it('应该能够按分类创建Mastra工具', () => {
      const basicTools = registry.createMastraToolsByCategory(ChartCategory.BASIC);
      expect(Object.keys(basicTools)).toHaveLength(2);
    });

    it('应该在工具不存在时抛出错误', () => {
      expect(() => {
        registry.createMastraTool('nonexistent');
      }).toThrow(ChartTypeRegistryError);
    });
  });

  describe('Event System', () => {
    it('应该触发注册事件', () => {
      const listener = vi.fn();
      registry.addEventListener(listener);

      registry.register(mockBarGenerator);

      expect(listener).toHaveBeenCalledWith('register', 'test-bar', expect.any(Object));
    });

    it('应该触发注销事件', () => {
      const listener = vi.fn();
      registry.register(mockBarGenerator);
      registry.addEventListener(listener);

      registry.unregister('test-bar');

      expect(listener).toHaveBeenCalledWith('unregister', 'test-bar', expect.any(Object));
    });

    it('应该触发更新事件', () => {
      const listener = vi.fn();
      registry.register(mockBarGenerator);
      registry.addEventListener(listener);

      registry.update('test-bar', { name: 'Updated' });

      expect(listener).toHaveBeenCalledWith('update', 'test-bar', expect.any(Object));
    });

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn();
      registry.addEventListener(listener);
      registry.removeEventListener(listener);

      registry.register(mockBarGenerator);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('应该在达到最大注册限制时抛出错误', () => {
      ChartTypeRegistry.reset();
      const limitedRegistry = ChartTypeRegistry.getInstance({
        maxRegistrations: 1
      });

      limitedRegistry.register(mockBarGenerator);

      expect(() => {
        limitedRegistry.register(mockPieGenerator);
      }).toThrow(ChartTypeRegistryError);
    });

    it('应该处理事件监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const faultyListener = vi.fn(() => {
        throw new Error('Listener error');
      });

      registry.addEventListener(faultyListener);
      registry.register(mockBarGenerator);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Data Export and Import', () => {
    beforeEach(() => {
      registry.register(mockBarGenerator, { category: ChartCategory.BASIC });
      registry.register(mockPieGenerator, { category: ChartCategory.BASIC });
    });

    it('应该能够导出注册表数据', () => {
      const exported = registry.export();
      
      expect(exported).toHaveLength(2);
      expect(exported[0]).toHaveProperty('type');
      expect(exported[0]).toHaveProperty('name');
      expect(exported[0]).toHaveProperty('category');
      expect(exported[0]).not.toHaveProperty('tool');
    });

    it('应该能够清空注册表', () => {
      registry.clear();
      
      expect(registry.getRegisteredTypes()).toHaveLength(0);
      expect(registry.getStats().totalRegistered).toBe(0);
    });
  });
});

describe('Chart Loader Tests', () => {
  let registry: ChartTypeRegistry;
  let loader: ChartLoader;

  beforeEach(() => {
    ChartTypeRegistry.reset();
    registry = ChartTypeRegistry.getInstance();
    loader = createDefaultChartLoader(registry);
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Loader Initialization', () => {
    it('应该创建默认加载器', () => {
      expect(loader).toBeDefined();
    });

    it('应该支持配置选项', () => {
      const configuredLoader = new ChartLoader(registry, {
        autoRegister: false,
        strictMode: true,
        excludeTypes: ['basic-bar']
      });
      
      expect(configuredLoader).toBeDefined();
    });
  });

  describe('Generator Discovery', () => {
    it('应该发现所有可用的生成器', async () => {
      await loader.loadAll();
      
      const registered = registry.getRegisteredTypes();
      expect(registered.length).toBeGreaterThan(0);
      expect(registered).toContain('basic-bar');
      expect(registered).toContain('basic-pie');
    });

    it('应该支持选择性加载', async () => {
      const selectiveLoader = new ChartLoader(registry, {
        includeTypes: ['basic-bar', 'basic-pie']
      });

      await selectiveLoader.loadAll();
      
      const registered = registry.getRegisteredTypes();
      expect(registered).toContain('basic-bar');
      expect(registered).toContain('basic-pie');
      expect(registered).not.toContain('bar-progress');
    });

    it('应该支持排除特定类型', async () => {
      const excludingLoader = new ChartLoader(registry, {
        excludeTypes: ['basic-bar']
      });

      await excludingLoader.loadAll();
      
      const registered = registry.getRegisteredTypes();
      expect(registered).not.toContain('basic-bar');
    });
  });

  describe('Category-based Loading', () => {
    it('应该能够按分类加载', async () => {
      const loaded = await loader.loadByCategory(ChartCategory.BASIC);
      
      expect(loaded.length).toBeGreaterThan(0);
      loaded.forEach(type => {
        expect(registry.has(type)).toBe(true);
        const info = registry.get(type);
        expect(info?.category).toBe(ChartCategory.BASIC);
      });
    });

    it('应该能够按需加载特定图表类型', async () => {
      const success = await loader.loadChartType('basic-bar');
      
      expect(success).toBe(true);
      expect(registry.has('basic-bar')).toBe(true);
    });

    it('应该在图表类型不存在时返回false', async () => {
      const success = await loader.loadChartType('nonexistent-chart');
      
      expect(success).toBe(false);
    });
  });

  describe('Loader Statistics', () => {
    it('应该提供加载统计信息', async () => {
      const statsBefore = loader.getStats();
      expect(statsBefore.registered).toBe(0);

      await loader.loadAll();

      const statsAfter = loader.getStats();
      expect(statsAfter.registered).toBeGreaterThan(0);
      expect(statsAfter.available).toBe(0); // 所有都已注册
    });
  });

  describe('Error Handling', () => {
    it('应该处理注册失败的情况', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 模拟严格模式下的重复注册
      registry.register(new BasicBarChartGenerator());
      
      const strictLoader = new ChartLoader(registry, { strictMode: false });
      await strictLoader.loadAll();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe('Integration Tests', () => {
  let registry: ChartTypeRegistry;

  beforeEach(() => {
    ChartTypeRegistry.reset();
    registry = ChartTypeRegistry.getInstance();
  });

  afterEach(() => {
    registry.clear();
  });

  it('应该完整地初始化和使用注册表', async () => {
    // 1. 加载所有图表类型
    const loader = createDefaultChartLoader(registry);
    await loader.loadAll();

    // 2. 验证注册成功
    const registeredTypes = registry.getRegisteredTypes();
    expect(registeredTypes.length).toBeGreaterThan(0);

    // 3. 创建Mastra工具
    const tools = registry.createAllMastraTools();
    expect(Object.keys(tools).length).toBe(registeredTypes.length);

    // 4. 测试工具功能
    const barTool = registry.createMastraTool('basic-bar');
    expect(barTool).toBeDefined();
    expect(barTool.id).toBe('generate-basic-bar');

    // 5. 验证统计信息
    const stats = registry.getStats();
    expect(stats.totalRegistered).toBeGreaterThan(0);
    expect(stats.categoryCounts.basic).toBeGreaterThan(0);
  });

  it('应该支持实际生成器的完整工作流', async () => {
    // 注册真实的生成器
    const barGenerator = new BasicBarChartGenerator();
    const pieGenerator = new BasicPieChartGenerator();
    const progressGenerator = new BarProgressChartGenerator();

    registry.registerBatch([
      { tool: barGenerator, options: { category: ChartCategory.BASIC } },
      { tool: pieGenerator, options: { category: ChartCategory.BASIC } },
      { tool: progressGenerator, options: { category: ChartCategory.PROGRESS } }
    ]);

    // 验证注册成功
    expect(registry.getRegisteredTypes()).toHaveLength(3);

    // 测试按分类获取
    const basicTypes = registry.getTypesByCategory(ChartCategory.BASIC);
    const progressTypes = registry.getTypesByCategory(ChartCategory.PROGRESS);

    expect(basicTypes).toHaveLength(2);
    expect(progressTypes).toHaveLength(1);

    // 测试工具创建
    const basicTools = registry.createMastraToolsByCategory(ChartCategory.BASIC);
    expect(Object.keys(basicTools)).toHaveLength(2);

    // 验证工具信息
    const barInfo = registry.get('basic-bar');
    expect(barInfo?.name).toBe('Basic Bar');
    expect(barInfo?.category).toBe(ChartCategory.BASIC);
    expect(barInfo?.supportsMultiSeries).toBe(false);
  });
}); 