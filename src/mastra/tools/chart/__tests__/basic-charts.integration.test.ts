import { describe, it, expect, beforeEach } from 'vitest';
import { BasicBarChartGenerator } from '../generators/basic-bar-chart.generator';
import { BasicColumnChartGenerator } from '../generators/basic-column-chart.generator';
import { BasicLineChartGenerator } from '../generators/basic-line-chart.generator';
import { BasicPieChartGenerator } from '../generators/basic-pie-chart.generator';

describe('Basic Charts Integration Tests', () => {
  let barGenerator: BasicBarChartGenerator;
  let columnGenerator: BasicColumnChartGenerator;
  let lineGenerator: BasicLineChartGenerator;
  let pieGenerator: BasicPieChartGenerator;

  beforeEach(() => {
    barGenerator = new BasicBarChartGenerator();
    columnGenerator = new BasicColumnChartGenerator();
    lineGenerator = new BasicLineChartGenerator();
    pieGenerator = new BasicPieChartGenerator();
  });

  describe('生成器实例化', () => {
    it('应该正确创建所有图表生成器实例', () => {
      expect(barGenerator.getChartType()).toBe('basic-bar');
      expect(columnGenerator.getChartType()).toBe('basic-column');
      expect(lineGenerator.getChartType()).toBe('basic-line');
      expect(pieGenerator.getChartType()).toBe('basic-pie');
    });
  });

  describe('数据格式兼容性', () => {
    const sampleData = [
      ['类别', '数值1', '数值2'],
      ['A', 100, 80],
      ['B', 150, 120],
      ['C', 200, 160]
    ];

    it('条形图和柱状图应该处理相同的数据格式', async () => {
      const barInput = {
        chartType: 'basic-bar',
        data: sampleData,
        title: '条形图测试'
      };

      const columnInput = {
        chartType: 'basic-column',
        data: sampleData,
        title: '柱状图测试'
      };

      const barResult = await barGenerator.generateConfig(barInput);
      const columnResult = await columnGenerator.generateConfig(columnInput);

      // 验证两者都能处理相同数据
      expect(barResult.props.type).toBe('basic-bar');
      expect(columnResult.props.type).toBe('basic-column');

      // 验证数据映射数量相同
      expect(barResult.props.map.length).toBe(columnResult.props.map.length);

      // 验证轴配置差异（条形图Y轴为类别，柱状图X轴为类别）
      expect(barResult.props.map[0].yAxisIndex).toBe(0);
      expect(columnResult.props.map[0].xAxisIndex).toBe(0);
    });

    it('折线图应该处理多系列时间序列数据', async () => {
      const timeSeriesData = [
        ['时间', '销售额', '利润'],
        ['2023-01', 1000, 200],
        ['2023-02', 1200, 250],
        ['2023-03', 1100, 220]
      ];

      const lineInput = {
        chartType: 'basic-line',
        data: timeSeriesData,
        title: '时间序列测试',
        lineType: 'curve' as const
      };

      const result = await lineGenerator.generateConfig(lineInput);

      expect(result.props.type).toBe('basic-line');
      expect(result.props.map).toHaveLength(3); // 1个X轴 + 2个Y轴
      expect(result.props.display.line.type).toBe('curve');
      expect(result.props.fill.controlType).toBe('multiple');
    });

    it('饼图应该处理键值对数据', async () => {
      const pieData = [
        ['产品A', 300],
        ['产品B', 250],
        ['产品C', 200],
        ['产品D', 150]
      ] as Array<[string, number]>;

      const pieInput = {
        chartType: 'basic-pie',
        data: pieData,
        title: '饼图测试',
        innerRadiusRatio: 0.3
      };

      const result = await pieGenerator.generateConfig(pieInput);

      expect(result.props.type).toBe('basic-pie');
      expect(result.props.map).toHaveLength(2); // 固定为名称+值
      expect(result.props.display.pie.innerRadiusRatio).toBe(0.3);
      expect(result.props.fill.controlType).toBe('multiple');
    });
  });

  describe('颜色主题一致性', () => {
    it('所有图表应该支持相同的主题系统', async () => {
      const testData = [
        ['类别', '数值'],
        ['A', 100],
        ['B', 150]
      ];

      const pieData = [
        ['A', 100],
        ['B', 150]
      ] as Array<[string, number]>;

      const inputs = [
        { generator: barGenerator, input: { chartType: 'basic-bar', data: testData, theme: 'dark' as const } },
        { generator: columnGenerator, input: { chartType: 'basic-column', data: testData, theme: 'dark' as const } },
        { generator: lineGenerator, input: { chartType: 'basic-line', data: testData, theme: 'dark' as const } },
        { generator: pieGenerator, input: { chartType: 'basic-pie', data: pieData, theme: 'dark' as const } }
      ];

      for (const { generator, input } of inputs) {
        const result = await generator.generateConfig(input);
        
        // 验证所有图表都有颜色配置
        expect(result.props.fill).toBeDefined();
        expect(result.props.fill.props).toBeDefined();
        expect(Array.isArray(result.props.fill.props)).toBe(true);
        expect(result.props.fill.props.length).toBeGreaterThan(0);

        // 验证颜色格式一致性
        result.props.fill.props.forEach((prop: any) => {
          expect(prop.color).toBeDefined();
          expect(prop.color.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(prop.color.opacity).toBe(1);
        });
      }
    });
  });

  describe('配置结构一致性', () => {
    it('所有图表应该有一致的基础配置结构', async () => {
      const testData = [['A', 100], ['B', 150]];
      const pieData = testData as Array<[string, number]>;

      const results = await Promise.all([
        barGenerator.generateConfig({ chartType: 'basic-bar', data: testData }),
        columnGenerator.generateConfig({ chartType: 'basic-column', data: testData }),
        lineGenerator.generateConfig({ chartType: 'basic-line', data: testData }),
        pieGenerator.generateConfig({ chartType: 'basic-pie', data: pieData })
      ]);

      results.forEach(result => {
        // 验证基础结构
        expect(result.data).toBeDefined();
        expect(result.pipe).toBeDefined();
        expect(result.props).toBeDefined();

        // 验证必需的props字段
        expect(result.props.type).toBeDefined();
        expect(result.props.title).toBeDefined();
        expect(result.props.background).toBeDefined();
        expect(result.props.map).toBeDefined();
        expect(result.props.fill).toBeDefined();
        expect(result.props.legend).toBeDefined();
        expect(result.props.label).toBeDefined();

        // 验证数据映射结构
        expect(Array.isArray(result.props.map)).toBe(true);
        result.props.map.forEach((mapping: any) => {
          expect(mapping.name).toBeDefined();
          expect(mapping.index).toBeDefined();
          expect(typeof mapping.isLegend).toBe('boolean');
          expect(mapping.function).toBeDefined();
          expect(typeof mapping.configurable).toBe('boolean');
          expect(mapping.type).toBeDefined();
        });
      });
    });
  });

  describe('错误处理一致性', () => {
    it('所有生成器应该一致地处理无效数据', async () => {
      const invalidInputs = [
        { chartType: 'basic-bar', data: [] },
        { chartType: 'basic-column', data: [] },
        { chartType: 'basic-line', data: [] },
        { chartType: 'basic-pie', data: [] as Array<[string, number]> }
      ];

      const generators = [barGenerator, columnGenerator, lineGenerator, pieGenerator];

      for (let i = 0; i < generators.length; i++) {
        await expect(generators[i].generateConfig(invalidInputs[i]))
          .rejects.toThrow();
      }
    });

    it('应该处理只有标题行的数据', async () => {
      const headerOnlyData = [['标题']];
      const pieHeaderOnlyData = [] as Array<[string, number]>; // 饼图不接受标题行格式

      const inputs = [
        { generator: barGenerator, input: { chartType: 'basic-bar', data: headerOnlyData } },
        { generator: columnGenerator, input: { chartType: 'basic-column', data: headerOnlyData } },
        { generator: lineGenerator, input: { chartType: 'basic-line', data: headerOnlyData } },
        { generator: pieGenerator, input: { chartType: 'basic-pie', data: pieHeaderOnlyData } }
      ];

      for (const { generator, input } of inputs) {
        await expect(generator.generateConfig(input))
          .rejects.toThrow();
      }
    });
  });

  describe('Schema 加载一致性', () => {
    it('所有生成器应该能够加载对应的schema', async () => {
      const generators = [barGenerator, columnGenerator, lineGenerator, pieGenerator];
      const expectedTypes = ['basic-bar', 'basic-column', 'basic-line', 'basic-pie'];

      for (let i = 0; i < generators.length; i++) {
        const schema = await generators[i].loadSchema();
        
        expect(schema).toBeDefined();
        expect(schema.type).toBe('object');
        expect(schema.properties).toBeDefined();
        expect(schema.properties.props).toBeDefined();
        expect(schema.properties.props.properties.type.const).toBe(expectedTypes[i]);
      }
    });
  });

  describe('性能和内存测试', () => {
    it('应该能够处理大量数据而不出现内存问题', async () => {
      // 生成大量测试数据
      const largeData = [['类别', '数值']];
      for (let i = 0; i < 1000; i++) {
        largeData.push([`项目${i}`, Math.floor(Math.random() * 1000)]);
      }

      const largePieData = largeData.slice(1).map(([name, value]) => [name as string, value as number]) as Array<[string, number]>;

      // 测试所有生成器
      const startTime = Date.now();

      await Promise.all([
        barGenerator.generateConfig({ chartType: 'basic-bar', data: largeData }),
        columnGenerator.generateConfig({ chartType: 'basic-column', data: largeData }),
        lineGenerator.generateConfig({ chartType: 'basic-line', data: largeData }),
        pieGenerator.generateConfig({ chartType: 'basic-pie', data: largePieData.slice(0, 100) }) // 饼图限制数量
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证性能（应该在合理时间内完成）
      expect(duration).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('自定义配置兼容性', () => {
    it('应该支持自定义颜色配置', async () => {
      const customColors = ['#FF5733', '#33FF57', '#3357FF'];
      const testData = [
        ['A', 100],
        ['B', 150],
        ['C', 200]
      ];
      const pieData = testData as Array<[string, number]>;

      const results = await Promise.all([
        barGenerator.generateConfig({ 
          chartType: 'basic-bar', 
          data: testData, 
          colors: customColors 
        }),
        columnGenerator.generateConfig({ 
          chartType: 'basic-column', 
          data: testData, 
          colors: customColors 
        }),
        lineGenerator.generateConfig({ 
          chartType: 'basic-line', 
          data: testData, 
          customColors 
        }),
        pieGenerator.generateConfig({ 
          chartType: 'basic-pie', 
          data: pieData, 
          customColors 
        })
      ]);

      results.forEach(result => {
        result.props.fill.props.forEach((prop: any, index: number) => {
          if (index < customColors.length) {
            expect(prop.color.color).toBe(customColors[index]);
          }
        });
      });
    });
  });
}); 