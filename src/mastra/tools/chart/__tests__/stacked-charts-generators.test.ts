import { describe, it, expect, beforeEach } from 'vitest';
import { StackedColumnChartGenerator } from '../generators/stacked-column-chart.generator';
import { StackedBarChartGenerator } from '../generators/stacked-bar-chart.generator';
import { StackedAreaChartGenerator } from '../generators/stacked-area-chart.generator';

describe('Stacked Charts Generators Tests', () => {
  // 测试数据 - 交叉表格式
  const sampleData = [
    ['地区', '2021年', '2022年', '2023年'],
    ['北京', 100, 120, 140],
    ['上海', 110, 130, 150],
    ['广州', 90, 100, 120],
    ['深圳', 105, 125, 145]
  ];

  const simpleData = [
    ['类别', '系列1', '系列2'],
    ['A', 10, 20],
    ['B', 15, 25],
    ['C', 12, 18]
  ];

  describe('StackedColumnChartGenerator', () => {
    let generator: StackedColumnChartGenerator;

    beforeEach(() => {
      generator = new StackedColumnChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(StackedColumnChartGenerator);
      expect(generator.getChartType()).toBe('stacked-column');
    });

    it('应该生成有效的堆叠柱状图配置', async () => {
      const input = {
        chartType: 'stacked-column' as const,
        data: sampleData,
        title: '堆叠柱状图示例',
        subtitle: '各地区年度数据对比'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([sampleData]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('stacked-column');
      expect(result.props.title).toBeDefined();
      expect(result.props.map).toHaveLength(4); // 1列分类 + 3列数值
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.display.column).toBeDefined();
    });

    it('应该正确处理自定义配置选项', async () => {
      const input = {
        chartType: 'stacked-column' as const,
        data: simpleData,
        colors: ['#ff6b6b', '#4ecdc4'],
        columnWidth: 0.6,
        stackSpacing: 3,
        showDataLabels: true
      };

      const result = await generator.generateConfig(input);

      expect(result.props.fill.props).toHaveLength(2);
      expect(result.props.fill.props[0].color.color).toBe('#ff6b6b');
      expect(result.props.fill.props[1].color.color).toBe('#4ecdc4');
      expect(result.props.display.column.widthPercent).toBe(0.6);
      expect(result.props.fill.props[0].border.width).toBe(3);
      expect(result.props.label.columnLabel.show).toBe(true);
    });

    it('应该验证输入数据格式', async () => {
      const invalidInput = {
        chartType: 'stacked-column' as const,
        data: [['单列数据']] // 缺少数值列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('堆叠柱状图需要至少2列数据');
    });

    it('应该正确构建数据映射', async () => {
      const input = {
        chartType: 'stacked-column' as const,
        data: sampleData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      expect(map[0]).toEqual({
        name: "X轴对象",
        index: 0,
        isLegend: true,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      expect(map[1]).toEqual({
        name: "数值列1",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "bar"
      });
    });

    it('应该加载对应的schema', async () => {
      const schema = await generator.loadSchema();
      expect(schema).toBeDefined();
      expect(schema.properties).toBeDefined();
      expect(schema.properties.data).toBeDefined();
      expect(schema.properties.props).toBeDefined();
    });
  });

  describe('StackedBarChartGenerator', () => {
    let generator: StackedBarChartGenerator;

    beforeEach(() => {
      generator = new StackedBarChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(StackedBarChartGenerator);
      expect(generator.getChartType()).toBe('stacked-bar');
    });

    it('应该生成有效的堆叠条形图配置', async () => {
      const input = {
        chartType: 'stacked-bar' as const,
        data: sampleData,
        title: '堆叠条形图示例'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([sampleData]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('stacked-bar');
      expect(result.props.display.bar).toBeDefined();
    });

    it('应该正确设置条形图的轴映射', async () => {
      const input = {
        chartType: 'stacked-bar' as const,
        data: sampleData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      // 条形图: Y轴为分类，X轴为数值
      expect(map[0]).toEqual({
        name: "Y轴对象",
        index: 0,
        isLegend: true,
        function: "objCol",
        configurable: true,
        yAxisIndex: 0,
        type: ""
      });

      expect(map[1]).toEqual({
        name: "数值列1",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        xAxisIndex: 0,
        type: "bar"
      });
    });

    it('应该正确配置坐标轴', async () => {
      const input = {
        chartType: 'stacked-bar' as const,
        data: sampleData
      };

      const result = await generator.generateConfig(input);

      expect(result.props.axis.xAxis[0].type).toBe('value');
      expect(result.props.axis.yAxis[0].type).toBe('category');
      expect(result.props.axis.yAxis[0].grid.show).toBe(false);
    });

    it('应该支持自定义条形图参数', async () => {
      const input = {
        chartType: 'stacked-bar' as const,
        data: simpleData,
        barHeight: 0.5,
        stackSpacing: 4
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.bar.widthPercent).toBe(0.5);
      expect(result.props.fill.props[0].border.width).toBe(4);
    });
  });

  describe('StackedAreaChartGenerator', () => {
    let generator: StackedAreaChartGenerator;

    beforeEach(() => {
      generator = new StackedAreaChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(StackedAreaChartGenerator);
      expect(generator.getChartType()).toBe('stacked-area');
    });

    it('应该生成有效的堆叠面积图配置', async () => {
      const input = {
        chartType: 'stacked-area' as const,
        data: sampleData,
        title: '堆叠面积图示例'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([sampleData]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('stacked-area');
      expect(result.props.display.area).toBeDefined();
    });

    it('应该正确设置面积图的映射', async () => {
      const input = {
        chartType: 'stacked-area' as const,
        data: sampleData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      expect(map[1].type).toBe('area');
      expect(map[2].type).toBe('area');
      expect(map[3].type).toBe('area');
    });

    it('应该支持面积图特定的配置选项', async () => {
      const input = {
        chartType: 'stacked-area' as const,
        data: simpleData,
        lineType: 'curve' as const,
        fillOpacity: 0.5,
        showPoints: false,
        pointRadius: 5
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.area.type).toBe('curve');
      expect(result.props.display.area.fillOpacity).toBe(0.5);
      expect(result.props.display.area.endPoint.radius).toBe(0); // showPoints: false
      expect(result.props.fill.props[0].color.opacity).toBe(0.5);
    });

    it('应该正确处理数据点配置', async () => {
      const input = {
        chartType: 'stacked-area' as const,
        data: simpleData,
        showPoints: true,
        pointRadius: 4
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.area.endPoint.radius).toBe(4);
      expect(result.props.display.area.endPoint.width).toBe(1);
    });

    it('应该使用正确的坐标轴配置', async () => {
      const input = {
        chartType: 'stacked-area' as const,
        data: sampleData
      };

      const result = await generator.generateConfig(input);

      expect(result.props.axis.xAxis[0].type).toBe('category');
      expect(result.props.axis.yAxis[0].type).toBe('value');
      expect(result.props.axis.xAxis[0].label.direction).toBe('horizontal');
    });
  });

  describe('通用功能测试', () => {
    it('所有生成器都应该返回正确的管道类型', async () => {
      const columnGen = new StackedColumnChartGenerator();
      const barGen = new StackedBarChartGenerator();
      const areaGen = new StackedAreaChartGenerator();

      const input = { chartType: 'test' as any, data: sampleData };

      const columnResult = await columnGen.generateConfig({ ...input, chartType: 'stacked-column' });
      const barResult = await barGen.generateConfig({ ...input, chartType: 'stacked-bar' });
      const areaResult = await areaGen.generateConfig({ ...input, chartType: 'stacked-area' });

      expect(columnResult.pipe).toBe('cross');
      expect(barResult.pipe).toBe('cross');
      expect(areaResult.pipe).toBe('cross');
    });

    it('所有生成器都应该支持主题配置', async () => {
      const generators = [
        { gen: new StackedColumnChartGenerator(), type: 'stacked-column' },
        { gen: new StackedBarChartGenerator(), type: 'stacked-bar' },
        { gen: new StackedAreaChartGenerator(), type: 'stacked-area' }
      ];

      for (const { gen, type } of generators) {
        const lightResult = await gen.generateConfig({
          chartType: type as any,
          data: simpleData,
          theme: 'light'
        });

        const darkResult = await gen.generateConfig({
          chartType: type as any,
          data: simpleData,
          theme: 'dark'
        });

        expect(lightResult.props.background).toBeDefined();
        expect(darkResult.props.background).toBeDefined();
        // 背景配置应该根据主题不同
        expect(lightResult.props.background).not.toEqual(darkResult.props.background);
      }
    });

    it('所有生成器都应该正确处理系列颜色', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const generators = [
        { gen: new StackedColumnChartGenerator(), type: 'stacked-column' },
        { gen: new StackedBarChartGenerator(), type: 'stacked-bar' },
        { gen: new StackedAreaChartGenerator(), type: 'stacked-area' }
      ];

      for (const { gen, type } of generators) {
        const result = await gen.generateConfig({
          chartType: type as any,
          data: sampleData,
          colors: customColors
        });

        expect(result.props.fill.props).toHaveLength(3); // 3个数值系列
        expect(result.props.fill.props[0].color.color).toBe('#ff0000');
        expect(result.props.fill.props[1].color.color).toBe('#00ff00');
        expect(result.props.fill.props[2].color.color).toBe('#0000ff');
      }
    });

    it('所有生成器都应该验证数据完整性', async () => {
      const invalidData = [['only-one-column']];
      const generators = [
        new StackedColumnChartGenerator(),
        new StackedBarChartGenerator(),
        new StackedAreaChartGenerator()
      ];

      for (const gen of generators) {
        await expect(gen.generateConfig({
          chartType: gen.getChartType() as any,
          data: invalidData
        })).rejects.toThrow('需要至少2列数据');
      }
    });

    it('所有生成器都应该有对应的schema', async () => {
      const generators = [
        new StackedColumnChartGenerator(),
        new StackedBarChartGenerator(), 
        new StackedAreaChartGenerator()
      ];

      for (const gen of generators) {
        const schema = await gen.loadSchema();
        expect(schema).toBeDefined();
        expect(schema.properties).toBeDefined();
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.props).toBeDefined();
        expect(schema.properties.props.properties.type.const).toBe(gen.getChartType());
      }
    });

    it('所有生成器都应该有正确的输入和输出schema', () => {
      const generators = [
        new StackedColumnChartGenerator(),
        new StackedBarChartGenerator(),
        new StackedAreaChartGenerator()
      ];

      for (const gen of generators) {
        const inputSchema = gen.getInputSchema();
        const outputSchema = gen.getOutputSchema();
        
        expect(inputSchema).toBeDefined();
        expect(outputSchema).toBeDefined();
        
        // 验证可以解析有效输入
        const validInput = {
          chartType: gen.getChartType(),
          data: sampleData,
          title: 'Test Chart'
        };
        
        expect(() => inputSchema.parse(validInput)).not.toThrow();
      }
    });
  });
}); 