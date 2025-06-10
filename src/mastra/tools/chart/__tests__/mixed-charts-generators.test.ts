import { describe, it, expect, beforeEach } from 'vitest';
import { MixedLineStackedColumnChartGenerator } from '../generators/mixed-line-stacked-column-chart.generator';
import { MixedLineGroupedColumnChartGenerator } from '../generators/mixed-line-grouped-column-chart.generator';

describe('Mixed Charts Generators Tests', () => {
  // 混合线条-堆叠柱状图测试数据 - 多列: X轴 + 3个柱状图列 + 2个线条图列
  const mixedLineStackedColumnData = [
    ["时间", "手机游戏", "客户端游戏", "网页游戏", "男性玩家数量", "女性玩家数量"],
    [2016, 5794, 6230, 2987, 8642, 6369],
    [2017, 7664, 5334, 2648, 9017, 6629],
    [2018, 10286, 4731, 2423, 10513, 6927],
    [2019, 13094, 4572, 2182, 10873, 8975],
    [2020, 14964, 5495, 1596, 11579, 10476]
  ];

  // 混合线条-分组柱状图测试数据 - 多列: X轴 + 1个线条图列 + 2个柱状图列
  const mixedLineGroupedColumnData = [
    ["月份", "蒸发", "降雨", "蓄水"],
    ["1月", 2, 2.6, 2.9],
    ["2月", 4.9, 5.9, 5.9],
    ["3月", 7, 9, 9],
    ["4月", 23.2, 26.4, 26.4],
    ["5月", 25.6, 28.7, 28.7],
    ["6月", 76.7, 70.7, 70.7]
  ];

  describe('MixedLineStackedColumnChartGenerator', () => {
    let generator: MixedLineStackedColumnChartGenerator;

    beforeEach(() => {
      generator = new MixedLineStackedColumnChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(MixedLineStackedColumnChartGenerator);
      expect(generator.getChartType()).toBe('mixed-line-stacked-column');
    });

    it('应该生成有效的混合线条-堆叠柱状图配置', async () => {
      const input = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        title: '混合线条-堆叠柱状图示例',
        subtitle: '游戏行业数据'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([mixedLineStackedColumnData]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('mixed-line-stacked-column');
      expect(result.props.map).toHaveLength(6); // X轴 + 5个数值列
      expect(result.props.display.line).toBeDefined();
      expect(result.props.display.bar).toBeDefined();
      expect(result.props.xAxis).toHaveLength(1);
      expect(result.props.yAxis).toHaveLength(2); // 左右双Y轴
    });

    it('应该正确构建混合线条-堆叠柱状图的数据映射', async () => {
      const input = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      // X轴对象
      expect(map[0]).toEqual({
        name: "X轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      // 默认前3列作为堆叠柱状图（左Y轴）
      expect(map[1].type).toBe("bar");
      expect(map[1].yAxisIndex).toBe(0);
      expect(map[2].type).toBe("bar");
      expect(map[2].yAxisIndex).toBe(0);
      expect(map[3].type).toBe("bar");
      expect(map[3].yAxisIndex).toBe(0);

      // 默认后2列作为线条图（右Y轴）
      expect(map[4].type).toBe("line");
      expect(map[4].yAxisIndex).toBe(1);
      expect(map[5].type).toBe("line");
      expect(map[5].yAxisIndex).toBe(1);
    });

    it('应该支持自定义列索引配置', async () => {
      const input = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        columnIndices: [1, 2], // 前两列作为柱状图
        lineIndices: [3, 4, 5] // 后三列作为线条图
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      // 验证柱状图列
      expect(map[1].index).toBe(1);
      expect(map[1].type).toBe("bar");
      expect(map[2].index).toBe(2);
      expect(map[2].type).toBe("bar");

      // 验证线条图列
      expect(map[3].index).toBe(3);
      expect(map[3].type).toBe("line");
      expect(map[4].index).toBe(4);
      expect(map[4].type).toBe("line");
      expect(map[5].index).toBe(5);
      expect(map[5].type).toBe("line");
    });

    it('应该支持线条和柱状图的自定义配置', async () => {
      const input = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        lineType: 'curve' as const,
        lineWidth: 5,
        columnWidthPercent: 0.8,
        showEndPoints: false,
        endPointRadius: 6
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.line.type).toBe('curve');
      expect(result.props.display.line.width).toBe(5);
      expect(result.props.display.line.endPoint.radius).toBe(0); // 关闭端点
      expect(result.props.display.bar.widthPercent).toBe(0.8);
    });

    it('应该支持Y轴配置', async () => {
      const input = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        leftYAxisConfig: {
          title: '游戏收入',
          unit: '万元'
        },
        rightYAxisConfig: {
          title: '玩家数量',
          unit: '万人'
        }
      };

      const result = await generator.generateConfig(input);

      expect(result.props.yAxis[0].title.show).toBe(true);
      expect(result.props.yAxis[0].title.text).toBe('游戏收入');
      expect(result.props.yAxis[0].label.suffix).toBe('万元');

      expect(result.props.yAxis[1].title.show).toBe(true);
      expect(result.props.yAxis[1].title.text).toBe('玩家数量');
      expect(result.props.yAxis[1].label.suffix).toBe('万人');
    });

    it('应该验证混合线条-堆叠柱状图数据格式', async () => {
      const invalidInput = {
        chartType: 'mixed-line-stacked-column' as const,
        data: [['时间', '数值1', '数值2']] // 只有3列，少于最小要求4列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('混合线条-堆叠柱状图需要至少4列数据');
    });

    it('应该验证列索引的有效性', async () => {
      const invalidInput1 = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        columnIndices: [1, 2],
        lineIndices: [2, 3] // 索引2重复
      };

      await expect(generator.generateConfig(invalidInput1))
        .rejects.toThrow('列索引不能重复');

      const invalidInput2 = {
        chartType: 'mixed-line-stacked-column' as const,
        data: mixedLineStackedColumnData,
        columnIndices: [1, 2],
        lineIndices: [10] // 索引超出范围
      };

      await expect(generator.generateConfig(invalidInput2))
        .rejects.toThrow('列索引超出数据范围');
    });
  });

  describe('MixedLineGroupedColumnChartGenerator', () => {
    let generator: MixedLineGroupedColumnChartGenerator;

    beforeEach(() => {
      generator = new MixedLineGroupedColumnChartGenerator();
    });

    it('应该正确创建生成器实例', () => {
      expect(generator).toBeInstanceOf(MixedLineGroupedColumnChartGenerator);
      expect(generator.getChartType()).toBe('mixed-line-grouped-column');
    });

    it('应该生成有效的混合线条-分组柱状图配置', async () => {
      const input = {
        chartType: 'mixed-line-grouped-column' as const,
        data: mixedLineGroupedColumnData,
        title: '混合线条-分组柱状图示例',
        subtitle: '气象数据'
      };

      const result = await generator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.data).toEqual([mixedLineGroupedColumnData]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('mixed-line-grouped-column');
      expect(result.props.map).toHaveLength(4); // X轴 + 3个数值列
      expect(result.props.display.line).toBeDefined();
      expect(result.props.display.bar).toBeDefined();
      expect(result.props.xAxis).toHaveLength(1);
      expect(result.props.yAxis).toHaveLength(2); // 左右双Y轴
    });

    it('应该正确构建混合线条-分组柱状图的数据映射', async () => {
      const input = {
        chartType: 'mixed-line-grouped-column' as const,
        data: mixedLineGroupedColumnData
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      // X轴对象
      expect(map[0]).toEqual({
        name: "X轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });

      // 默认第1列作为线条图（右Y轴）
      expect(map[1].index).toBe(1);
      expect(map[1].type).toBe("line");
      expect(map[1].yAxisIndex).toBe(1);

      // 默认第2、3列作为分组柱状图（左Y轴）
      expect(map[2].index).toBe(2);
      expect(map[2].type).toBe("bar");
      expect(map[2].yAxisIndex).toBe(0);
      expect(map[3].index).toBe(3);
      expect(map[3].type).toBe("bar");
      expect(map[3].yAxisIndex).toBe(0);
    });

    it('应该支持自定义列索引配置', async () => {
      const input = {
        chartType: 'mixed-line-grouped-column' as const,
        data: mixedLineGroupedColumnData,
        lineIndices: [1, 2], // 第1、2列作为线条图
        columnIndices: [3] // 第3列作为柱状图
      };

      const result = await generator.generateConfig(input);
      const map = result.props.map;

      // 验证线条图列
      expect(map[1].index).toBe(1);
      expect(map[1].type).toBe("line");
      expect(map[2].index).toBe(2);
      expect(map[2].type).toBe("line");

      // 验证柱状图列
      expect(map[3].index).toBe(3);
      expect(map[3].type).toBe("bar");
    });

    it('应该支持线条和柱状图的自定义配置', async () => {
      const input = {
        chartType: 'mixed-line-grouped-column' as const,
        data: mixedLineGroupedColumnData,
        lineType: 'curve' as const,
        lineWidth: 4,
        columnWidthPercent: 0.6,
        showEndPoints: true,
        endPointRadius: 5
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.line.type).toBe('curve');
      expect(result.props.display.line.width).toBe(4);
      expect(result.props.display.line.endPoint.radius).toBe(5);
      expect(result.props.display.bar.widthPercent).toBe(0.6);
    });

    it('应该验证混合线条-分组柱状图数据格式', async () => {
      const invalidInput = {
        chartType: 'mixed-line-grouped-column' as const,
        data: [['时间', '数值1']] // 只有2列，少于最小要求3列
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('混合线条-分组柱状图需要至少3列数据');
    });
  });

  describe('通用功能测试', () => {
    it('所有生成器都应该返回cross管道类型', async () => {
      const stackedGen = new MixedLineStackedColumnChartGenerator();
      const groupedGen = new MixedLineGroupedColumnChartGenerator();

      const stackedResult = await stackedGen.generateConfig({
        chartType: 'mixed-line-stacked-column',
        data: mixedLineStackedColumnData
      });

      const groupedResult = await groupedGen.generateConfig({
        chartType: 'mixed-line-grouped-column',
        data: mixedLineGroupedColumnData
      });

      // 混合图表都使用cross管道
      expect(stackedResult.pipe).toBe('cross');
      expect(groupedResult.pipe).toBe('cross');
    });

    it('所有生成器都应该支持自定义颜色', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      const generators = [
        { gen: new MixedLineStackedColumnChartGenerator(), type: 'mixed-line-stacked-column', data: mixedLineStackedColumnData },
        { gen: new MixedLineGroupedColumnChartGenerator(), type: 'mixed-line-grouped-column', data: mixedLineGroupedColumnData }
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
        { gen: new MixedLineStackedColumnChartGenerator(), type: 'mixed-line-stacked-column', data: mixedLineStackedColumnData },
        { gen: new MixedLineGroupedColumnChartGenerator(), type: 'mixed-line-grouped-column', data: mixedLineGroupedColumnData }
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

    it('所有生成器都应该正确配置双Y轴', async () => {
      const generators = [
        { gen: new MixedLineStackedColumnChartGenerator(), type: 'mixed-line-stacked-column', data: mixedLineStackedColumnData },
        { gen: new MixedLineGroupedColumnChartGenerator(), type: 'mixed-line-grouped-column', data: mixedLineGroupedColumnData }
      ];

      for (const { gen, type, data } of generators) {
        const result = await gen.generateConfig({
          chartType: type as any,
          data
        });

        expect(result.props.yAxis).toHaveLength(2);
        expect(result.props.yAxis[0].position).toBe('left');
        expect(result.props.yAxis[1].position).toBe('right');
        expect(result.props.yAxis[0].grid.show).toBe(true); // 左轴显示网格
        expect(result.props.yAxis[1].grid.show).toBe(false); // 右轴不显示网格
      }
    });

    it('所有生成器都应该有对应的schema', async () => {
      const generators = [
        new MixedLineStackedColumnChartGenerator(),
        new MixedLineGroupedColumnChartGenerator()
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
        new MixedLineStackedColumnChartGenerator(),
        new MixedLineGroupedColumnChartGenerator()
      ];

      for (const gen of generators) {
        const inputSchema = gen.getInputSchema();
        const outputSchema = gen.getOutputSchema();
        
        expect(inputSchema).toBeDefined();
        expect(outputSchema).toBeDefined();
      }
    });

    it('所有生成器都应该有正确的元素类型', () => {
      const stackedGen = new MixedLineStackedColumnChartGenerator();
      const groupedGen = new MixedLineGroupedColumnChartGenerator();

      expect(stackedGen['getElementType']()).toBe('mixed');
      expect(groupedGen['getElementType']()).toBe('mixed');
    });

    it('所有生成器都应该正确处理标签配置', async () => {
      const generators = [
        { gen: new MixedLineStackedColumnChartGenerator(), type: 'mixed-line-stacked-column', data: mixedLineStackedColumnData },
        { gen: new MixedLineGroupedColumnChartGenerator(), type: 'mixed-line-grouped-column', data: mixedLineGroupedColumnData }
      ];

      for (const { gen, type, data } of generators) {
        const result = await gen.generateConfig({
          chartType: type as any,
          data
        });

        expect(result.props.label.show).toBe(false);
        expect(result.props.label.barLabel).toBeDefined();
        expect(result.props.label.lineLabel).toBeDefined();
      }
    });
  });
}); 