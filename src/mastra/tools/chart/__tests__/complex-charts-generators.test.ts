import { describe, it, expect, beforeEach } from 'vitest';
import { VoronoiChartGenerator } from '../generators/voronoi-chart.generator';
import { SankeyChartGenerator } from '../generators/sankey-chart.generator';
import { TreemapChartGenerator } from '../generators/treemap-chart.generator';

describe('Complex Charts Generators Tests', () => {
  // Voronoi图测试数据 - 三列: 一级分类, 二级对象, 数值
  const voronoiData = [
    ['学科分类', '专业分类', '图书数量'],
    ['社会科学', '哲学', 796],
    ['社会科学', '经济学', 1386],
    ['社会科学', '历史', 605],
    ['自然科学', '数学', 979],
    ['自然科学', '天文学', 256],
    ['自然科学', '化学', 860],
    ['工业技术', '交通运输', 1746],
    ['工业技术', '航空航天', 1678]
  ];

  // Sankey图测试数据 - 三列: source, target, value
  const sankeyData = [
    ['source', 'target', '人数'],
    ['男', '华为', 1100],
    ['男', '苹果', 730],
    ['女', '华为', 680],
    ['女', '苹果', 1080],
    ['华为', '25-34岁', 986],
    ['华为', '18-24岁', 240],
    ['苹果', '25-34岁', 659],
    ['苹果', '18-24岁', 545]
  ];

  // Treemap图测试数据 - 两列: 名称, 值
  const treemapData = [
    ['项目', '金额'],
    ['项目A', 1200],
    ['项目B', 800],
    ['项目C', 1500],
    ['项目D', 600],
    ['项目E', 900]
  ];

  describe('VoronoiChartGenerator', () => {
    let generator: VoronoiChartGenerator;

    beforeEach(() => {
      generator = new VoronoiChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(VoronoiChartGenerator);
      expect(generator.getChartType()).toBe('voronoi');
    });

    it('应该生成有效的Voronoi图配置', async () => {
      const input = {
        chartType: 'voronoi' as const,
        data: voronoiData,
        title: 'Voronoi图示例',
        subtitle: '图书分布'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([voronoiData]);
      expect(result.pipe).toBe('key_value');
      expect(result.props.type).toBe('voronoi');
      expect(result.props.map).toHaveLength(3); // 三列映射
      expect(result.props.display.voronoi).toBeDefined();
    });

    it('应该正确构建Voronoi图的数据映射', async () => {
      const input = {
        chartType: 'voronoi' as const,
        data: voronoiData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      expect(map[0]).toEqual({
        name: "一级分类",
        index: 0,
        isLegend: true,
        function: "typeCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      expect(map[1]).toEqual({
        name: "二级对象",
        index: 1,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      expect(map[2]).toEqual({
        name: "数值",
        index: 2,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "voronoi"
      });
    });

    it('应该支持Voronoi图的自定义配置', async () => {
      const input = {
        chartType: 'voronoi' as const,
        data: voronoiData,
        drawShape: 'circle' as const,
        drawStyle: 'fixed' as const,
        cornerRadius: 5,
        fillOpacity: 0.7,
        showBorder: true,
        borderWidth: 2
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.voronoi.drawShape).toBe('circle');
      expect(result.props.display.voronoi.drawStyle).toBe('fixed');
      expect(result.props.display.voronoi.cornerRadius).toBe(5);
      expect(result.props.display.voronoi.fillOpacity).toBe(0.7);
      expect(result.props.display.voronoi.border.width).toBe(2);
    });

    it('应该验证Voronoi图数据格式', async () => {
      const invalidInput = {
        chartType: 'voronoi' as const,
        data: [['名称', '值']] // 只有两列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('Voronoi图需要恰好3列数据');
    });

    it('应该根据分类数量生成正确的颜色', async () => {
      const input = {
        chartType: 'voronoi' as const,
        data: voronoiData
      };

      const result = await generator.generateConfig(input);

      // voronoiData有3个一级分类: 社会科学、自然科学、工业技术
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.fill.props).toHaveLength(3);
    });
  });

  describe('SankeyChartGenerator', () => {
    let generator: SankeyChartGenerator;

    beforeEach(() => {
      generator = new SankeyChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(SankeyChartGenerator);
      expect(generator.getChartType()).toBe('sankey');
    });

    it('应该生成有效的Sankey图配置', async () => {
      const input = {
        chartType: 'sankey' as const,
        data: sankeyData,
        title: 'Sankey图示例',
        subtitle: '人群流向分析'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([sankeyData]);
      expect(result.pipe).toBe('key_value');
      expect(result.props.type).toBe('sankey');
      expect(result.props.map).toHaveLength(3); // source, target, value
      expect(result.props.display.sankey).toBeDefined();
    });

    it('应该正确构建Sankey图的数据映射', async () => {
      const input = {
        chartType: 'sankey' as const,
        data: sankeyData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      expect(map[0]).toEqual({
        name: "起始项",
        index: 0,
        isLegend: true,
        function: "sourceCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      expect(map[1]).toEqual({
        name: "目标项",
        index: 1,
        isLegend: true,
        function: "targetCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      expect(map[2]).toEqual({
        name: "数值",
        index: 2,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "sankey"
      });
    });

    it('应该支持Sankey图的节点和连线配置', async () => {
      const input = {
        chartType: 'sankey' as const,
        data: sankeyData,
        nodeWidth: 15,
        gapDistance: 10,
        fillOpacity: 0.5,
        linkColor: 'gradient' as const
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.sankey.nodeWidth).toBe(15);
      expect(result.props.display.sankey.gapDistance).toBe(10);
      expect(result.props.display.sankey.fillOpacity).toBe(0.5);
      expect(result.props.display.sankey.color).toBe('gradient');
    });

    it('应该处理不同的连线颜色配置', async () => {
      const autoInput = {
        chartType: 'sankey' as const,
        data: sankeyData,
        linkColor: 'auto' as const
      };

      const autoResult = await generator.generateConfig(autoInput);
      expect(autoResult.props.display.sankey.color).toBe(null);

      const customInput = {
        chartType: 'sankey' as const,
        data: sankeyData,
        linkColor: '#ff0000'
      };

      const customResult = await generator.generateConfig(customInput);
      expect(customResult.props.display.sankey.color).toEqual({
        color: '#ff0000',
        opacity: 1
      });
    });

    it('应该验证Sankey图数据格式', async () => {
      const invalidInput = {
        chartType: 'sankey' as const,
        data: [['名称', '值']] // 只有两列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('Sankey图需要恰好3列数据');
    });
  });

  describe('TreemapChartGenerator', () => {
    let generator: TreemapChartGenerator;

    beforeEach(() => {
      generator = new TreemapChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(TreemapChartGenerator);
      expect(generator.getChartType()).toBe('single-layer-treemap');
    });

    it('应该生成有效的树状图配置', async () => {
      const input = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData,
        title: '树状图示例',
        subtitle: '项目占比'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([treemapData]);
      expect(result.pipe).toBe('key_value');
      expect(result.props.type).toBe('single-layer-treemap');
      expect(result.props.map).toHaveLength(2); // 名称和值
      expect(result.props.display.bar).toBeDefined();
    });

    it('应该正确构建树状图的数据映射', async () => {
      const input = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      expect(map[0]).toEqual({
        name: "名称",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        type: ""
      });

      expect(map[1]).toEqual({
        name: "值",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        type: "bar"
      });
    });

    it('应该支持树状图的边框和间隙配置', async () => {
      const input = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData,
        gapDistance: 5,
        fillOpacity: 0.8,
        borderWidth: 2,
        borderColor: '#000000'
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.bar.gapDistance).toBe(5);
      expect(result.props.display.bar.fillOpacity).toBe(0.8);
      expect(result.props.display.bar.border.width).toBe(2);
      expect(result.props.display.bar.border.color).toEqual({
        color: '#000000',
        opacity: 1
      });
    });

    it('应该正确处理边框圆角配置', async () => {
      // 单个数值
      const singleInput = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData,
        borderRadius: 5
      };

      const singleResult = await generator.generateConfig(singleInput);
      expect(singleResult.props.display.bar.border.radius).toBe(5);

      // 数组格式
      const arrayInput = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData,
        borderRadius: [5, 10]
      };

      const arrayResult = await generator.generateConfig(arrayInput);
      expect(arrayResult.props.display.bar.border.radius).toEqual([5, 10, 5, 10]);
    });

    it('应该验证树状图数据格式', async () => {
      const invalidInput = {
        chartType: 'single-layer-treemap' as const,
        data: [['名称', '值', '额外列']] // 有三列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('单层树状图需要恰好2列数据');
    });

    it('应该根据数据项数量生成颜色', async () => {
      const input = {
        chartType: 'single-layer-treemap' as const,
        data: treemapData
      };

      const result = await generator.generateConfig(input);

      // treemapData有5个数据项（除header外）
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.fill.props).toHaveLength(5);
    });
  });

  describe('通用功能测试', () => {
    it('所有生成器都应该返回正确的管道类型', async () => {
      const voronoiGen = new VoronoiChartGenerator();
      const sankeyGen = new SankeyChartGenerator();
      const treemapGen = new TreemapChartGenerator();

      const voronoiResult = await voronoiGen.generateConfig({
        chartType: 'voronoi',
        data: voronoiData
      });

      const sankeyResult = await sankeyGen.generateConfig({
        chartType: 'sankey',
        data: sankeyData
      });

      const treemapResult = await treemapGen.generateConfig({
        chartType: 'single-layer-treemap',
        data: treemapData
      });

      // 复杂图表都使用key_value管道
      expect(voronoiResult.pipe).toBe('key_value');
      expect(sankeyResult.pipe).toBe('key_value');
      expect(treemapResult.pipe).toBe('key_value');
    });

    it('所有生成器都应该支持自定义颜色', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const generators = [
        { gen: new VoronoiChartGenerator(), type: 'voronoi', data: voronoiData },
        { gen: new SankeyChartGenerator(), type: 'sankey', data: sankeyData },
        { gen: new TreemapChartGenerator(), type: 'single-layer-treemap', data: treemapData }
      ];

      for (const { gen, type, data } of generators) {
        const result = await gen.generateConfig({
          chartType: type as any,
          data,
          colors: customColors
        });

        expect(result.props.fill.props[0].color.color).toBe('#ff0000');
        expect(result.props.fill.props[1].color.color).toBe('#00ff00');
        expect(result.props.fill.props[2].color.color).toBe('#0000ff');
      }
    });

    it('所有生成器都应该支持主题配置', async () => {
      const generators = [
        { gen: new VoronoiChartGenerator(), type: 'voronoi', data: voronoiData },
        { gen: new SankeyChartGenerator(), type: 'sankey', data: sankeyData },
        { gen: new TreemapChartGenerator(), type: 'single-layer-treemap', data: treemapData }
      ];

      for (const { gen, type, data } of generators) {
        const lightResult = await gen.generateConfig({
          chartType: type as any,
          data,
          theme: 'light'
        });

        const darkResult = await gen.generateConfig({
          chartType: type as any,
          data,
          theme: 'dark'
        });

        expect(lightResult.props.background).toBeDefined();
        expect(darkResult.props.background).toBeDefined();
        expect(lightResult.props.background).not.toEqual(darkResult.props.background);
      }
    });

    it('所有生成器都应该有对应的schema', async () => {
      const generators = [
        new VoronoiChartGenerator(),
        new SankeyChartGenerator(),
        new TreemapChartGenerator()
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
        new VoronoiChartGenerator(),
        new SankeyChartGenerator(),
        new TreemapChartGenerator()
      ];

      for (const gen of generators) {
        const inputSchema = gen.getInputSchema();
        const outputSchema = gen.getOutputSchema();
        
        expect(inputSchema).toBeDefined();
        expect(outputSchema).toBeDefined();
      }
    });

    it('所有生成器都应该有正确的元素类型', () => {
      const voronoiGen = new VoronoiChartGenerator();
      const sankeyGen = new SankeyChartGenerator();
      const treemapGen = new TreemapChartGenerator();

      expect(voronoiGen['getElementType']()).toBe('voronoi');
      expect(sankeyGen['getElementType']()).toBe('sankey');
      expect(treemapGen['getElementType']()).toBe('bar'); // treemap使用bar类型
    });
  });
}); 