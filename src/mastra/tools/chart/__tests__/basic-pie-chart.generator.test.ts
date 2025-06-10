import { describe, it, expect, beforeEach } from 'vitest';
import { BasicPieChartGenerator, BasicPieChartInputSchema } from '../generators/basic-pie-chart.generator';

describe('BasicPieChartGenerator', () => {
  let generator: BasicPieChartGenerator;

  beforeEach(() => {
    generator = new BasicPieChartGenerator();
  });

  describe('实例创建', () => {
    it('应该正确创建 BasicPieChartGenerator 实例', () => {
      expect(generator).toBeInstanceOf(BasicPieChartGenerator);
      expect(generator.getChartType()).toBe('basic-pie');
    });
  });

  describe('输入验证', () => {
    it('应该验证有效的饼图输入数据', () => {
      const validInput = {
        data: [
          ['苹果', 30],
          ['香蕉', 25],
          ['橙子', 20],
          ['葡萄', 15],
          ['其他', 10]
        ] as Array<[string, number]>,
        title: '水果销量分布',
        innerRadiusRatio: 0.3,
        gapPercentage: 2,
        showLabels: true,
        labelPosition: 'outside-ellipse' as const
      };

      const result = BasicPieChartInputSchema.parse(validInput);
      expect(result.title).toBe('水果销量分布');
      expect(result.innerRadiusRatio).toBe(0.3);
      expect(result.gapPercentage).toBe(2);
      expect(result.showLabels).toBe(true);
      expect(result.labelPosition).toBe('outside-ellipse');
    });

    it('应该为缺失的可选字段提供默认值', () => {
      const minimalInput = {
        data: [
          ['A', 100],
          ['B', 200]
        ] as Array<[string, number]>
      };

      const result = BasicPieChartInputSchema.parse(minimalInput);
      expect(result.title).toBe('基础饼图');
      expect(result.subtitle).toBe('副标题');
      expect(result.innerRadiusRatio).toBe(0);
      expect(result.gapPercentage).toBe(0);
      expect(result.showLabels).toBe(false);
      expect(result.labelPosition).toBe('outside-ellipse');
    });

    it('应该拒绝空数据', () => {
      const invalidInput = {
        data: [] as Array<[string, number]>
      };

      expect(() => BasicPieChartInputSchema.parse(invalidInput))
        .toThrow('饼图至少需要一个数据项');
    });

    it('应该验证innerRadiusRatio范围', () => {
      const validInput = {
        data: [['A', 100]] as Array<[string, number]>,
        innerRadiusRatio: 0.5
      };

      const result = BasicPieChartInputSchema.parse(validInput);
      expect(result.innerRadiusRatio).toBe(0.5);

      // 测试边界值
      const inputAtMax = {
        data: [['A', 100]] as Array<[string, number]>,
        innerRadiusRatio: 0.99
      };
      expect(() => BasicPieChartInputSchema.parse(inputAtMax)).not.toThrow();

      // 测试超出范围值
      const inputOverMax = {
        data: [['A', 100]] as Array<[string, number]>,
        innerRadiusRatio: 1.0
      };
      expect(() => BasicPieChartInputSchema.parse(inputOverMax)).toThrow();
    });

    it('应该验证标签位置枚举值', () => {
      const positions = ['inside', 'outside-ellipse', 'outside-circle'] as const;
      
      positions.forEach(position => {
        const input = {
          data: [['A', 100]] as Array<[string, number]>,
          labelPosition: position
        };

        const result = BasicPieChartInputSchema.parse(input);
        expect(result.labelPosition).toBe(position);
      });

      // 测试无效位置
      const inputWithInvalidPosition = {
        data: [['A', 100]] as Array<[string, number]>,
        labelPosition: 'invalid' as any
      };

      expect(() => BasicPieChartInputSchema.parse(inputWithInvalidPosition))
        .toThrow();
    });
  });

  describe('配置生成', () => {
    it('应该生成正确的饼图配置', async () => {
      const input = {
        chartType: 'basic-pie',
        data: [
          ['产品A', 300],
          ['产品B', 250],
          ['产品C', 200],
          ['产品D', 150]
        ] as Array<[string, number]>,
        title: '产品销量分布',
        innerRadiusRatio: 0,
        showLabels: true
      };

      const result = await generator.generateConfig(input);

      // 验证基本结构
      expect(result.props.type).toBe('basic-pie');

      // 验证数据映射 - 饼图固定为两列
      expect(result.props.map).toHaveLength(2);
      expect(result.props.map[0]).toEqual({
        name: "名称",
        index: 0,
        isLegend: true,
        function: "objCol",
        configurable: true,
        xAxisIndex: 0,
        type: ""
      });
      expect(result.props.map[1]).toEqual({
        name: "值",
        index: 1,
        isLegend: false,
        function: "vCol",
        configurable: true,
        yAxisIndex: 0,
        type: "pie"
      });

      // 验证显示配置
      expect(result.props.display.pie.innerRadiusRatio).toBe(0);
      expect(result.props.display.pie.gapPercentage).toBe(0);

      // 验证填充配置 - 饼图使用多色
      expect(result.props.fill.controlType).toBe('multiple');
      expect(result.props.fill.props).toHaveLength(4); // 对应4个数据项
    });

    it('应该生成正确的甜甜圈图配置', async () => {
      const input = {
        chartType: 'basic-pie',
        data: [
          ['类别1', 40],
          ['类别2', 35],
          ['类别3', 25]
        ] as Array<[string, number]>,
        title: '甜甜圈图',
        innerRadiusRatio: 0.5,
        gapPercentage: 5
      };

      const result = await generator.generateConfig(input);

      // 验证甜甜圈图特有配置
      expect(result.props.display.pie.innerRadiusRatio).toBe(0.5);
      expect(result.props.display.pie.gapPercentage).toBe(5);
      
      // 验证颜色数量对应数据项数量
      expect(result.props.fill.props).toHaveLength(3);
    });

    it('应该支持自定义颜色', async () => {
      const customColors = ['#FF5733', '#33FF57', '#3357FF'];
      const input = {
        chartType: 'basic-pie',
        data: [
          ['A', 100],
          ['B', 200],
          ['C', 150]
        ] as Array<[string, number]>,
        customColors
      };

      const result = await generator.generateConfig(input);

      // 验证自定义颜色被正确应用
      result.props.fill.props.forEach((prop: any, index: number) => {
        expect(prop.color.color).toBe(customColors[index]);
      });
    });

    it('应该正确配置标签显示', async () => {
      const input = {
        chartType: 'basic-pie',
        data: [
          ['项目1', 50],
          ['项目2', 30]
        ] as Array<[string, number]>,
        showLabels: true,
        labelPosition: 'inside' as const
      };

      const result = await generator.generateConfig(input);

      expect(result.props.label.show).toBe(true);
      expect(result.props.label.textLabel.show).toBe(true);
      expect(result.props.label.textLabel.positionChoice).toBe('inside');
      expect(result.props.label.numberLabel.show).toBe(true);
      expect(result.props.label.numberLabel.positionChoice).toBe('inside');
    });

    it('应该处理不同的标签位置选项', async () => {
      const positions = ['inside', 'outside-ellipse', 'outside-circle'] as const;

      for (const position of positions) {
        const input = {
          chartType: 'basic-pie',
          data: [['A', 100]] as Array<[string, number]>,
          showLabels: true,
          labelPosition: position
        };

        const result = await generator.generateConfig(input);

        expect(result.props.label.textLabel.positionChoice).toBe(position);
        expect(result.props.label.numberLabel.positionChoice).toBe(position);
      }
    });

    it('应该正确配置阴影和边框', async () => {
      const input = {
        chartType: 'basic-pie',
        data: [
          ['测试', 100]
        ] as Array<[string, number]>
      };

      const result = await generator.generateConfig(input);

      const fillProps = result.props.fill.props[0];
      expect(fillProps.shadow).toEqual({
        show: false,
        type: "outer",
        angle: 45,
        blur: 5,
        color: { color: "#000000", opacity: 0.3 },
        radius: 3
      });

      expect(fillProps.border).toEqual({
        type: "solid",
        width: 0,
        color: null
      });
    });
  });

  describe('错误处理', () => {
    it('应该拒绝空数据数组', async () => {
      const input = {
        chartType: 'basic-pie',
        data: [] as Array<[string, number]>
      };

      await expect(generator.generateConfig(input))
        .rejects.toThrow();
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
      expect(schema.properties.props.properties.type.const).toBe('basic-pie');
    });
  });
}); 