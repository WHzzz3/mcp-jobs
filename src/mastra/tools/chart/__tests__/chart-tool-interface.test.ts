import { describe, it, expect, beforeEach } from 'vitest';
import { BaseChartTool, BaseChartInput, BaseChartOutput } from '../interfaces/chart-tool.interface';
import { createChartTool, ChartToolRegistry } from '../utils/chart-tool-factory';
import { 
  generateDefaultTitle, 
  generateDefaultBackground,
  generateDefaultLegend,
  validateChartData,
  processChartData,
  createChartOutput,
  getThemeColors
} from '../utils/chart-helpers';

// 创建一个测试用的具体图表工具类
class TestChartTool extends BaseChartTool {
  constructor() {
    super('test-chart', {
      theme: 'light',
      title: 'Test Chart',
    });
  }

  protected getElementType(): string {
    return 'bar';
  }

  public async generateConfig(input: BaseChartInput): Promise<BaseChartOutput> {
    const mergedInput = this.mergeWithDefaults(input);
    this.validateInput(mergedInput);

    return createChartOutput(this.chartType, mergedInput, {
      map: this.createDefaultDataMapping(mergedInput.data || []),
    });
  }
}

describe('Chart Tool Interface', () => {
  let testChartTool: TestChartTool;
  let chartToolRegistry: ChartToolRegistry;

  beforeEach(() => {
    testChartTool = new TestChartTool();
    chartToolRegistry = ChartToolRegistry.getInstance();
    chartToolRegistry.clear(); // 清除之前的注册
  });

  describe('BaseChartTool', () => {
    it('should initialize with correct chart type', () => {
      expect(testChartTool.getChartType()).toBe('test-chart');
    });

    it('should merge defaults with input', () => {
      const input: BaseChartInput = {
        chartType: 'test-chart',
        data: [['A', 'B'], [1, 2]],
      };

      const merged = (testChartTool as any).mergeWithDefaults(input);
      expect(merged.theme).toBe('light');
      expect(merged.title).toBe('Test Chart');
      expect(merged.chartType).toBe('test-chart');
    });

    it('should validate input correctly', () => {
      const validInput: BaseChartInput = {
        chartType: 'test-chart',
        data: [['A', 'B'], [1, 2]],
      };

      expect(() => {
        (testChartTool as any).validateInput(validInput);
      }).not.toThrow();

      const invalidInput: BaseChartInput = {
        chartType: 'wrong-chart',
        data: [['A', 'B'], [1, 2]],
      };

      expect(() => {
        (testChartTool as any).validateInput(invalidInput);
      }).toThrow('Invalid chart type');
    });

    it('should create default data mapping', () => {
      const data = [['Category', 'Value'], ['A', 10], ['B', 20]];
      const mapping = (testChartTool as any).createDefaultDataMapping(data);

      expect(mapping).toHaveLength(2);
      expect(mapping[0].name).toBe('分类');
      expect(mapping[0].index).toBe(0);
      expect(mapping[1].name).toBe('数值');
      expect(mapping[1].index).toBe(1);
      expect(mapping[1].type).toBe('bar');
    });

    it('should generate chart config successfully', async () => {
      const input: BaseChartInput = {
        chartType: 'test-chart',
        data: [['Category', 'Value'], ['A', 10], ['B', 20]],
        title: 'My Test Chart',
      };

      const config = await testChartTool.generateConfig(input);

      expect(config.data).toBeDefined();
      expect(config.pipe).toBe('key_value');
      expect(config.props.type).toBe('test-chart');
      expect(config.props.title?.mainTitle?.text).toBe('My Test Chart');
    });
  });

  describe('createChartTool', () => {
    it('should create a mastra tool from chart tool', () => {
      const mastraTool = createChartTool(testChartTool);

      expect(mastraTool).toBeDefined();
      expect(mastraTool.id).toContain('test-chart');
    });

    it('should create tool with custom options', () => {
      const mastraTool = createChartTool(testChartTool, {
        id: 'custom-test-tool',
        description: 'Custom test tool description',
      });

      expect(mastraTool.id).toBe('custom-test-tool');
    });
  });

  describe('ChartToolRegistry', () => {
    it('should register and retrieve chart tools', () => {
      chartToolRegistry.register(testChartTool);

      expect(chartToolRegistry.isRegistered('test-chart')).toBe(true);
      expect(chartToolRegistry.get('test-chart')).toBe(testChartTool);
    });

    it('should return registered chart types', () => {
      chartToolRegistry.register(testChartTool);
      
      const types = chartToolRegistry.getRegisteredChartTypes();
      expect(types).toContain('test-chart');
    });

    it('should get all registered tools', () => {
      chartToolRegistry.register(testChartTool);
      
      const tools = chartToolRegistry.getAllTools();
      expect(tools).toHaveLength(1);
      expect(tools[0]).toBe(testChartTool);
    });

    it('should create all mastra tools', () => {
      chartToolRegistry.register(testChartTool);
      
      const mastraTools = chartToolRegistry.createAllMastraTools();
      expect(Object.keys(mastraTools)).toHaveLength(1);
      expect(mastraTools['test-chartChartTool']).toBeDefined();
    });
  });

  describe('Chart Helpers', () => {
    describe('generateDefaultTitle', () => {
      it('should generate title with provided text', () => {
        const title = generateDefaultTitle('Main Title', 'Sub Title');
        
        expect(title.show).toBe(true);
        expect(title.mainTitle.text).toBe('Main Title');
        expect(title.subTitle.text).toBe('Sub Title');
        expect(title.subTitle.show).toBe(true);
      });

      it('should handle missing title', () => {
        const title = generateDefaultTitle();
        
        expect(title.show).toBe(false);
        expect(title.mainTitle.show).toBe(false);
        expect(title.subTitle.show).toBe(false);
      });
    });

    describe('generateDefaultBackground', () => {
      it('should generate light theme background', () => {
        const bg = generateDefaultBackground('light');
        
        expect(bg.show).toBe(false);
        expect(bg.color.color).toBe('#ffffff');
      });

      it('should generate dark theme background', () => {
        const bg = generateDefaultBackground('dark');
        
        expect(bg.show).toBe(false);
        expect(bg.color.color).toBe('#1a1a1a');
      });
    });

    describe('getThemeColors', () => {
      it('should return correct number of colors', () => {
        const colors = getThemeColors('light', 3);
        
        expect(colors).toHaveLength(3);
        expect(colors[0].color).toBe('#5AAEF3');
      });

      it('should cycle colors when count exceeds available', () => {
        const colors = getThemeColors('light', 10);
        
        expect(colors).toHaveLength(10);
        // Should cycle back to first color
        expect(colors[8].color).toBe(colors[0].color);
      });
    });

    describe('validateChartData', () => {
      it('should validate correct data format', () => {
        const data = [['A', 'B'], [1, 2], [3, 4]];
        
        expect(() => validateChartData(data)).not.toThrow();
      });

      it('should reject invalid data formats', () => {
        expect(() => validateChartData([])).toThrow('at least 2 rows');
        expect(() => validateChartData([['A']])).toThrow('at least 2 columns');
        expect(() => validateChartData([['A', 'B'], [1]])).toThrow('inconsistent column count');
      });
    });

    describe('processChartData', () => {
      it('should convert to three-dimensional array', () => {
        const data = [['A', 'B'], [1, 2]];
        const processed = processChartData(data);
        
        expect(processed).toHaveLength(1);
        expect(processed[0]).toEqual(data);
      });
    });

    describe('createChartOutput', () => {
      it('should create complete chart output', () => {
        const input: BaseChartInput = {
          chartType: 'test-chart',
          data: [['Category', 'Value'], ['A', 10]],
          title: 'Test Title',
        };

        const output = createChartOutput('test-chart', input);

        expect(output.data).toBeDefined();
        expect(output.pipe).toBe('key_value');
        expect(output.props.type).toBe('test-chart');
        expect(output.props.title?.mainTitle?.text).toBe('Test Title');
      });

      it('should merge custom props', () => {
        const input: BaseChartInput = {
          chartType: 'test-chart',
          data: [['Category', 'Value'], ['A', 10]],
        };

        const customProps = {
          tooltip: true,
          animation: { show: true },
        };

        const output = createChartOutput('test-chart', input, customProps);

        expect(output.props.tooltip).toBe(true);
        expect(output.props.animation?.show).toBe(true);
      });
    });
  });
}); 