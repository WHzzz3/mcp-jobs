import { describe, it, expect, beforeEach } from 'vitest';
import { BasicBarChartGenerator } from '../generators/basic-bar-chart.generator';
import { BasicColumnChartGenerator } from '../generators/basic-column-chart.generator';

describe('Basic Charts Generators', () => {
  const sampleData = [
    ["地区", "销量"],
    ["华东", 4668],
    ["华北", 3775],
    ["西南", 2912],
    ["东北", 2200],
    ["华中", 1259],
    ["西北", 700],
    ["华南", 403]
  ];

  describe('BasicBarChartGenerator', () => {
    let generator: BasicBarChartGenerator;

    beforeEach(() => {
      generator = new BasicBarChartGenerator();
    });

    it('should create generator instance', () => {
      expect(generator).toBeInstanceOf(BasicBarChartGenerator);
      expect(generator.getChartType()).toBe('basic-bar');
    });

    it('should generate basic bar chart configuration', async () => {
      const input = {
        chartType: 'basic-bar',
        data: sampleData,
        title: '基础条形图测试',
        subtitle: '测试副标题'
      };

      const result = await generator.generateConfig(input);
      
      expect(result).toBeDefined();
      expect(result.data).toEqual([input.data]);
      expect(result.pipe).toBe('key_value');
      expect(result.props.type).toBe('basic-bar');
      expect(result.props.title.mainTitle.text).toBe('基础条形图测试');
      expect(result.props.title.subTitle.text).toBe('测试副标题');
    });

    it('should handle custom colors', async () => {
      const input = {
        data: [sampleData],
        colors: ['#FF0000', '#00FF00', '#0000FF']
      };

      const result = await generator.generateConfig(input);
      
      expect(result.props.fill.props).toHaveLength(3);
      expect(result.props.fill.props[0].color.color).toBe('#FF0000');
      expect(result.props.fill.props[1].color.color).toBe('#00FF00');
      expect(result.props.fill.props[2].color.color).toBe('#0000FF');
    });

    it('should configure axis correctly for bar chart', async () => {
      const input = {
        data: [sampleData]
      };

      const result = await generator.generateConfig(input);
      
      // 条形图：X轴为数值，Y轴为分类
      expect(result.props.axis.xAxis[0].type).toBe('value');
      expect(result.props.axis.yAxis[0].type).toBe('category');
      
      // 数据映射：Y轴映射名称，X轴映射值
      expect(result.props.map[0].yAxisIndex).toBe(0);
      expect(result.props.map[1].xAxisIndex).toBe(0);
    });

    it('should handle label configuration', async () => {
      const input = {
        data: [sampleData],
        showLabels: true
      };

      const result = await generator.generateConfig(input);
      
      expect(result.props.label.show).toBe(true);
      expect(result.props.label.barLabel.show).toBe(true);
      expect(result.props.label.barLabel.positionChoice).toBe('right');
    });
  });

  describe('BasicColumnChartGenerator', () => {
    let generator: BasicColumnChartGenerator;

    beforeEach(() => {
      generator = new BasicColumnChartGenerator();
    });

    it('should create generator instance', () => {
      expect(generator).toBeInstanceOf(BasicColumnChartGenerator);
      expect(generator.getChartType()).toBe('basic-column');
    });

    it('should generate basic column chart configuration', async () => {
      const input = {
        data: [sampleData],
        title: '基础柱状图测试',
        subtitle: '测试副标题'
      };

      const result = await generator.generateConfig(input);
      
      expect(result).toBeDefined();
      expect(result.data).toEqual([input.data]);
      expect(result.pipe).toBe('key_value');
      expect(result.props.type).toBe('basic-column');
      expect(result.props.title.mainTitle.text).toBe('基础柱状图测试');
      expect(result.props.title.subTitle.text).toBe('测试副标题');
    });

    it('should configure axis correctly for column chart', async () => {
      const input = {
        data: [sampleData]
      };

      const result = await generator.generateConfig(input);
      
      // 柱状图：X轴为分类，Y轴为数值
      expect(result.props.axis.xAxis[0].type).toBe('category');
      expect(result.props.axis.yAxis[0].type).toBe('value');
      
      // 数据映射：X轴映射名称，Y轴映射值
      expect(result.props.map[0].xAxisIndex).toBe(0);
      expect(result.props.map[1].yAxisIndex).toBe(0);
    });

    it('should configure labels for column chart', async () => {
      const input = {
        data: [sampleData],
        showLabels: true
      };

      const result = await generator.generateConfig(input);
      
      expect(result.props.label.show).toBe(true);
      expect(result.props.label.barLabel.show).toBe(true);
      expect(result.props.label.barLabel.positionChoice).toBe('top'); // 柱状图标签在顶部
    });

    it('should handle bar width configuration', async () => {
      const input = {
        data: [sampleData],
        barWidth: 0.5
      };

      const result = await generator.generateConfig(input);
      
      expect(result.props.display.bar.widthPercent).toBe(0.5);
    });
  });

  describe('Chart Type Differences', () => {
    it('should have different axis configurations between bar and column charts', async () => {
      const barGenerator = new BasicBarChartGenerator();
      const columnGenerator = new BasicColumnChartGenerator();
      
      const input = { data: [sampleData] };
      
      const barResult = await barGenerator.generateConfig(input);
      const columnResult = await columnGenerator.generateConfig(input);
      
      // 条形图和柱状图的轴配置应该相反
      expect(barResult.props.axis.xAxis[0].type).toBe('value');
      expect(barResult.props.axis.yAxis[0].type).toBe('category');
      
      expect(columnResult.props.axis.xAxis[0].type).toBe('category');
      expect(columnResult.props.axis.yAxis[0].type).toBe('value');
    });

    it('should have different label positions', async () => {
      const barGenerator = new BasicBarChartGenerator();
      const columnGenerator = new BasicColumnChartGenerator();
      
      const input = { data: [sampleData], showLabels: true };
      
      const barResult = await barGenerator.generateConfig(input);
      const columnResult = await columnGenerator.generateConfig(input);
      
      expect(barResult.props.label.barLabel.positionChoice).toBe('right');
      expect(columnResult.props.label.barLabel.positionChoice).toBe('top');
    });
  });
}); 