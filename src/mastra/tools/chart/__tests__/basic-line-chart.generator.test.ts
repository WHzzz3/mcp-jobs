import { describe, it, expect, beforeEach } from 'vitest';
import { BasicLineChartGenerator, BasicLineChartInputSchema } from '../generators/basic-line-chart.generator';

describe('BasicLineChartGenerator', () => {
  let generator: BasicLineChartGenerator;

  beforeEach(() => {
    generator = new BasicLineChartGenerator();
  });

  describe('实例创建', () => {
    it('应该正确创建 BasicLineChartGenerator 实例', () => {
      expect(generator).toBeInstanceOf(BasicLineChartGenerator);
      expect(generator.getChartType()).toBe('basic-line');
    });
  });

  describe('输入验证', () => {
    it('应该验证有效的折线图输入数据', () => {
      const validInput = {
        data: [
          ['年份', '销售额', '利润'],
          [2020, 100, 20],
          [2021, 150, 30],
          [2022, 200, 50]
        ],
        title: '年度销售趋势',
        lineType: 'straight' as const,
        lineWidth: 3,
        showPoints: true,
        pointRadius: 4
      };

      const result = BasicLineChartInputSchema.parse(validInput);
      expect(result.title).toBe('年度销售趋势');
      expect(result.lineType).toBe('straight');
      expect(result.lineWidth).toBe(3);
      expect(result.showPoints).toBe(true);
      expect(result.pointRadius).toBe(4);
    });

    it('应该为缺失的可选字段提供默认值', () => {
      const minimalInput = {
        data: [
          ['月份', '访问量'],
          ['1月', 1000],
          ['2月', 1200]
        ]
      };

      const result = BasicLineChartInputSchema.parse(minimalInput);
      expect(result.title).toBe('基础折线图');
      expect(result.subtitle).toBe('副标题');
      expect(result.lineType).toBe('straight');
      expect(result.lineWidth).toBe(3);
      expect(result.showPoints).toBe(true);
      expect(result.pointRadius).toBe(4);
      expect(result.showLabels).toBe(false);
    });

    it('应该拒绝无效的数据格式', () => {
      const invalidInput = {
        data: [] // 空数组
      };

      expect(() => BasicLineChartInputSchema.parse(invalidInput))
        .toThrow('数据至少需要包含标题行和一行数据');
    });

    it('应该验证折线类型枚举值', () => {
      const inputWithCurve = {
        data: [['x', 'y'], [1, 10]],
        lineType: 'curve' as const
      };

      const result = BasicLineChartInputSchema.parse(inputWithCurve);
      expect(result.lineType).toBe('curve');

      // 测试无效的线条类型
      const inputWithInvalidType = {
        data: [['x', 'y'], [1, 10]],
        lineType: 'invalid' as any
      };

      expect(() => BasicLineChartInputSchema.parse(inputWithInvalidType))
        .toThrow();
    });
  });

  describe('配置生成', () => {
    it('应该生成正确的折线图配置 - 单系列数据', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['月份', '销售额'],
          ['1月', 1000],
          ['2月', 1200],
          ['3月', 1100]
        ],
        title: '月度销售',
        lineType: 'straight' as const,
        lineWidth: 2,
        showPoints: true,
        pointRadius: 3
      };

      const result = await generator.generateConfig(input);

      // 验证基本结构
      expect(result.data).toEqual([input.data]);
      expect(result.pipe).toBe('cross');
      expect(result.props.type).toBe('basic-line');

      // 验证数据映射
      expect(result.props.map).toHaveLength(2);
      expect(result.props.map[0]).toEqual({
        name: "X轴对象",
        index: 0,
        isLegend: false,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });
      expect(result.props.map[1]).toEqual({
        name: "数值列",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "line"
      });

      // 验证显示配置
      expect(result.props.display.line.type).toBe('straight');
      expect(result.props.display.line.width).toBe(2);
      expect(result.props.display.line.endPoint.radius).toBe(3);

      // 验证填充配置
      expect(result.props.fill.controlType).toBe('single');
      expect(result.props.fill.props).toHaveLength(1);
    });

    it('应该生成正确的折线图配置 - 多系列数据', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['年份', '销售额', '利润', '成本'],
          [2020, 100, 20, 80],
          [2021, 150, 30, 120],
          [2022, 200, 50, 150]
        ],
        title: '财务趋势',
        customColors: ['#FF5733', '#33FF57', '#3357FF']
      };

      const result = await generator.generateConfig(input);

      // 验证多系列数据映射
      expect(result.props.map).toHaveLength(4); // 1个X轴 + 3个Y轴
      expect(result.props.map[1].type).toBe('line');
      expect(result.props.map[2].type).toBe('line');
      expect(result.props.map[3].type).toBe('line');

      // 验证填充配置为多系列
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.fill.props).toHaveLength(3);
    });

    it('应该正确配置曲线类型', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['时间', '温度'],
          ['8:00', 18],
          ['12:00', 25],
          ['18:00', 22]
        ],
        lineType: 'curve' as const,
        lineWidth: 4
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.line.type).toBe('curve');
      expect(result.props.display.line.width).toBe(4);
    });

    it('应该支持隐藏数据点', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['x', 'y'],
          [1, 10],
          [2, 20]
        ],
        showPoints: false
      };

      const result = await generator.generateConfig(input);

      expect(result.props.display.line.endPoint.radius).toBe(0);
    });

    it('应该正确配置坐标轴', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['时间', '数值'],
          ['00:00', 0],
          ['12:00', 100]
        ]
      };

      const result = await generator.generateConfig(input);

      // 验证X轴配置（类别轴）
      expect(result.props.axis.xAxis).toHaveLength(1);
      expect(result.props.axis.xAxis[0].type).toBe('category');
      expect(result.props.axis.xAxis[0].position).toBe('bottom');

      // 验证Y轴配置（数值轴）
      expect(result.props.axis.yAxis).toHaveLength(1);
      expect(result.props.axis.yAxis[0].type).toBe('value');
      expect(result.props.axis.yAxis[0].position).toBe('left');
    });

    it('应该处理标签显示配置', async () => {
      const input = {
        chartType: 'basic-line',
        data: [
          ['项目', '数值'],
          ['A', 100],
          ['B', 200]
        ],
        showLabels: true
      };

      const result = await generator.generateConfig(input);

      expect(result.props.label.show).toBe(true);
      expect(result.props.label.lineLabel.show).toBe(true);
      expect(result.props.label.lineLabel.positionChoice).toBe('top');
    });
  });

  describe('错误处理', () => {
    it('应该拒绝空数据', async () => {
      const input = {
        data: []
      };

      await expect(generator.generateConfig(input))
        .rejects.toThrow('数据格式无效：需要至少包含标题行和一行数据');
    });

    it('应该拒绝只有标题行的数据', async () => {
      const input = {
        data: [['标题']]
      };

      await expect(generator.generateConfig(input))
        .rejects.toThrow('数据格式无效：需要至少包含标题行和一行数据');
    });

    it('应该拒绝没有数值列的数据', async () => {
      const input = {
        data: [
          ['分类'],
          ['A'],
          ['B']
        ]
      };

      await expect(generator.generateConfig(input))
        .rejects.toThrow('至少需要一个数值列用于绘制折线');
    });
  });

  describe('Schema 加载', () => {
    it('应该能够加载和合并 schema', async () => {
      const schema = await generator.loadSchema();
      
      expect(schema).toBeDefined();
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties.data).toBeDefined();
      expect(schema.properties.props).toBeDefined();
    });
  });
}); 