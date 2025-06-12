import { describe, it, expect, beforeEach } from 'vitest';
import { GroupedColumnChartGenerator, GroupedColumnChartInputSchema } from '../generators/grouped-column-chart.generator';
import { GroupedBarChartGenerator, GroupedBarChartInputSchema } from '../generators/grouped-bar-chart.generator';

describe('Grouped Charts Generators', () => {
  describe('GroupedColumnChartGenerator', () => {
    let generator: GroupedColumnChartGenerator;

    beforeEach(() => {
      generator = new GroupedColumnChartGenerator();
    });

    it('should create generator with correct chart type', () => {
      expect(generator.getChartType()).toBe('grouped-column');
    });

    it('should validate correct multi-series data', () => {
      const validData = [
        ["省份", "北京市", "上海市", "广州市", "深圳市"],
        ["2008", 12418, 8195, 9123, 12665],
        ["2010", 17782, 14464, 11921, 19170],
        ["2012", 17021.63, 14061.37, 13162.67, 19589.82]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      // 缺少数据行
      expect(generator.validateData([["省份", "北京市"]])).toBe(false);
      
      // 列数不一致
      const invalidData = [
        ["省份", "北京市", "上海市"],
        ["2008", 12418], // 缺少一列
        ["2010", 17782, 14464, 11921] // 多了一列
      ];
      expect(generator.validateData(invalidData)).toBe(false);
    });

    it('should generate correct chart configuration for multi-series data', async () => {
      const input = {
        data: [
          ["省份", "北京市", "上海市", "广州市"],
          ["2008", 12418, 8195, 9123],
          ["2010", 17782, 14464, 11921]
        ],
        title: '分组柱状图测试',
        subtitle: '测试副标题',
        showLabels: true,
        columnWidth: 0.8
      };

      const result = await generator.generateConfig(input);

      // 验证基本结构
      expect(result.data).toHaveLength(1);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('grouped-column');

      // 验证数据映射
      expect(result.props.map).toHaveLength(4); // 1个类别列 + 3个数值列
      expect(result.props.map[0].name).toBe('X轴对象');
      expect(result.props.map[0].function).toBe('objCol');
      expect(result.props.map[0].xAxisIndex).toBe(0);

      // 验证数值列映射
      for (let i = 1; i <= 3; i++) {
        expect(result.props.map[i].name).toBe('数值列');
        expect(result.props.map[i].function).toBe('vCol');
        expect(result.props.map[i].type).toBe('bar');
        expect(result.props.map[i].yAxisIndex).toBe(0);
      }

      // 验证填充配置
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.fill.props).toHaveLength(3); // 3个系列的颜色

      // 验证显示配置
      expect(result.props.display.bar.widthPercent).toBe(0.8);

      // 验证坐标轴配置
      expect(result.props.axis.xAxis[0].type).toBe('category');
      expect(result.props.axis.yAxis[0].type).toBe('value');

      // 验证标签配置
      expect(result.props.label.show).toBe(true);
      expect(result.props.label.barLabel.positionChoice).toBe('top');
    });

    it('should handle default values correctly', async () => {
      const input = {
        data: [
          ["省份", "北京市", "上海市"],
          ["2008", 12418, 8195]
        ]
      };

      const result = await generator.generateConfig(input);

      expect(result.props.title.mainTitle.text).toBe('分组柱状图');
      expect(result.props.title.subTitle.text).toBe('副标题');
      expect(result.props.display.bar.widthPercent).toBe(0.7);
      expect(result.props.label.show).toBe(false);
    });

    it('should validate input schema correctly', () => {
      const validInput = {
        data: [
          ["省份", "北京市", "上海市"],
          ["2008", 12418, 8195]
        ],
        title: "测试图表",
        columnWidth: 0.5
      };

      expect(() => GroupedColumnChartInputSchema.parse(validInput)).not.toThrow();

      const invalidInput = {
        data: [], // 无效的空数据
        columnWidth: 1.5 // 超出范围
      };

      expect(() => GroupedColumnChartInputSchema.parse(invalidInput)).toThrow();
    });

    it('should provide correct chart metadata', () => {
      const metadata = generator.getChartMetadata();
      
      expect(metadata.type).toBe('grouped-column');
      expect(metadata.name).toBe('分组柱状图');
      expect(metadata.category).toBe('column');
      expect(metadata.dataFormat).toBe('cross');
      expect(metadata.features).toContain('grouping');
      expect(metadata.features).toContain('multiple-series');
    });
  });

  describe('GroupedBarChartGenerator', () => {
    let generator: GroupedBarChartGenerator;

    beforeEach(() => {
      generator = new GroupedBarChartGenerator();
    });

    it('should create generator with correct chart type', () => {
      expect(generator.getChartType()).toBe('grouped-bar');
    });

    it('should generate correct chart configuration for horizontal bars', async () => {
      const input = {
        data: [
          ["城市", "全国", "广州市", "上海市"],
          [2008, 3800, 9123, 8195],
          [2010, 5032, 11921, 14464]
        ],
        title: '分组条形图测试',
        showLabels: true,
        barHeight: 0.6
      };

      const result = await generator.generateConfig(input);

      // 验证基本结构
      expect(result.props.type).toBe('grouped-bar');

      // 验证数据映射 - 条形图的轴配置与柱状图相反
      expect(result.props.map[0].name).toBe('Y轴对象');
      expect(result.props.map[0].function).toBe('objCol');
      expect(result.props.map[0].yAxisIndex).toBe(0);

      // 验证数值列映射到X轴
      for (let i = 1; i <= 3; i++) {
        expect(result.props.map[i].xAxisIndex).toBe(0);
      }

      // 验证坐标轴配置 - 条形图轴类型相反
      expect(result.props.axis.xAxis[0].type).toBe('value');
      expect(result.props.axis.yAxis[0].type).toBe('category');

      // 验证标签位置
      expect(result.props.label.barLabel.positionChoice).toBe('right');

      // 验证条形高度设置
      expect(result.props.display.bar.widthPercent).toBe(0.6);
    });

    it('should validate grouped bar chart input schema', () => {
      const validInput = {
        data: [
          ["城市", "全国", "广州市"],
          [2008, 3800, 9123]
        ],
        barHeight: 0.8
      };

      expect(() => GroupedBarChartInputSchema.parse(validInput)).not.toThrow();
    });

    it('should provide correct metadata for bar chart', () => {
      const metadata = generator.getChartMetadata();
      
      expect(metadata.type).toBe('grouped-bar');
      expect(metadata.name).toBe('分组条形图');
      expect(metadata.category).toBe('bar');
      expect(metadata.features).toContain('horizontal-comparison');
    });
  });

  describe('Cross Data Format Integration', () => {
    it('should handle complex multi-series data correctly', async () => {
      const columnGenerator = new GroupedColumnChartGenerator();
      const barGenerator = new GroupedBarChartGenerator();

      const complexData = [
        ["年份", "北京", "上海", "广州", "深圳", "杭州"],
        ["2020", 45000, 38000, 32000, 41000, 28000],
        ["2021", 48000, 39500, 33500, 43500, 29800],
        ["2022", 51000, 42000, 35000, 46000, 31500]
      ];

      const columnResult = await columnGenerator.generateConfig({
        data: complexData,
        title: '多城市GDP对比（柱状图）'
      });

      const barResult = await barGenerator.generateConfig({
        data: complexData,
        title: '多城市GDP对比（条形图）'
      });

      // 两种图表都应该正确处理5个数据系列
      expect(columnResult.props.map).toHaveLength(6); // 1类别 + 5数值
      expect(barResult.props.map).toHaveLength(6);

      // 验证填充颜色数量
      expect(columnResult.props.fill.props).toHaveLength(5);
      expect(barResult.props.fill.props).toHaveLength(5);

      // 验证数据格式
      expect(columnResult.pipe).toBe('cross');
      expect(barResult.pipe).toBe('cross');
    });
  });
}); 