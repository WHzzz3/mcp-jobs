import { describe, it, expect, beforeEach } from 'vitest';
import { RiverAreaChartGenerator } from '../generators/river-area-chart.generator';
import { CascadedAreaChartGenerator } from '../generators/cascaded-area-chart.generator';
import { ButterflyChartGenerator } from '../generators/butterfly-chart.generator';
import { chartToolRegistry } from '../utils/chart-tool-factory';

describe('复杂面积图表生成器', () => {
  let riverAreaGenerator: RiverAreaChartGenerator;
  let cascadedAreaGenerator: CascadedAreaChartGenerator;
  let butterflyGenerator: ButterflyChartGenerator;

  beforeEach(() => {
    riverAreaGenerator = new RiverAreaChartGenerator();
    cascadedAreaGenerator = new CascadedAreaChartGenerator();
    butterflyGenerator = new ButterflyChartGenerator();
  });

  describe('RiverAreaChartGenerator', () => {
    it('应该正确初始化', () => {
      expect(riverAreaGenerator.getChartType()).toBe('river-area');
    });

    it('应该生成有效的河流面积图配置', async () => {
      const input = {
        data: [
          [
            ["时间", "美国", "希腊", "德国", "法国"],
            [1896, 20, 46, 13, 11],
            [1900, 74, 0, 0, 101],
            [1904, 239, 0, 13, 0],
            [1908, 47, 0, 14, 19]
          ]
        ],
        title: "奥运奖牌河流图",
        subtitle: "各国奖牌数量变化",
        chartType: 'river-area' as const
      };

      const result = await riverAreaGenerator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.props.type).toBe('river-area');
      expect(result.props.title.mainTitle.text).toBe("奥运奖牌河流图");
      expect(result.props.title.subTitle.text).toBe("各国奖牌数量变化");
      expect(result.data).toEqual(input.data);
      expect(result.pipe).toBe('cross');

      // 验证数据映射（X轴时间 + 4个数值系列）
      expect(result.props.map).toHaveLength(5);
      expect(result.props.map[0].name).toBe("X轴对象");
      expect(result.props.map[0].xAxisIndex).toBe(0);
      
      // 验证系列映射
      for (let i = 1; i <= 4; i++) {
        expect(result.props.map[i].name).toBe("数值列");
        expect(result.props.map[i].type).toBe("area");
        expect(result.props.map[i].yAxisIndex).toBe(0);
      }

      // 验证显示配置
      expect(result.props.display.area).toBeDefined();
      expect(result.props.display.area.type).toBe('curve');
      expect(result.props.display.area.centerBaseline).toBe(true);
    });

    it('应该正确处理自定义配置', async () => {
      const input = {
        data: [
          [
            ["月份", "产品A", "产品B"],
            ["1月", 100, 200],
            ["2月", 150, 180]
          ]
        ],
        areaType: 'straight' as const,
        areaOpacity: 0.5,
        centerBaseline: false,
        chartType: 'river-area' as const
      };

      const result = await riverAreaGenerator.generateConfig(input);

      expect(result.props.display.area.type).toBe('straight');
      expect(result.props.display.area.opacity).toBe(0.5);
      expect(result.props.display.area.centerBaseline).toBe(false);
    });
  });

  describe('CascadedAreaChartGenerator', () => {
    it('应该正确初始化', () => {
      expect(cascadedAreaGenerator.getChartType()).toBe('cascaded-area');
    });

    it('应该生成有效的层叠面积图配置', async () => {
      const input = {
        data: [
          [
            ["季度", "Q1", "Q2", "Q3", "Q4"],
            ["收入", 1000, 1200, 1500, 1800],
            ["成本", 600, 700, 800, 900],
            ["利润", 400, 500, 700, 900]
          ]
        ],
        title: "季度财务层叠图",
        subtitle: "收入成本利润趋势",
        chartType: 'cascaded-area' as const
      };

      const result = await cascadedAreaGenerator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.props.type).toBe('cascaded-area');
      expect(result.props.title.mainTitle.text).toBe("季度财务层叠图");
      expect(result.pipe).toBe('cross');

      // 验证数据映射
      expect(result.props.map).toHaveLength(4);
      expect(result.props.map[0].name).toBe("X轴对象");
      
      // 验证显示配置
      expect(result.props.display.area.type).toBe('straight');
      expect(result.props.display.area.stackMode).toBe('normal');
    });

    it('应该正确处理百分比模式', async () => {
      const input = {
        data: [
          [
            ["月份", "A", "B", "C"],
            ["1月", 30, 40, 30],
            ["2月", 25, 45, 30]
          ]
        ],
        stackMode: 'percent' as const,
        chartType: 'cascaded-area' as const
      };

      const result = await cascadedAreaGenerator.generateConfig(input);

      expect(result.props.display.area.stackMode).toBe('percent');
      expect(result.props.axis.yAxis[0].label.suffix).toBe('%');
      expect(result.props.axis.yAxis[0].max).toBe(100);
    });
  });

  describe('ButterflyChartGenerator', () => {
    it('应该正确初始化', () => {
      expect(butterflyGenerator.getChartType()).toBe('butterfly');
    });

    it('应该生成有效的蝴蝶图配置', async () => {
      const input = {
        data: [
          [
            ["年龄段", "男性", "女性"],
            ["0-10", 120, 115],
            ["11-20", 150, 145],
            ["21-30", 180, 175],
            ["31-40", 160, 155]
          ]
        ],
        title: "人口年龄结构蝴蝶图",
        subtitle: "男女比例分布",
        chartType: 'butterfly' as const
      };

      const result = await butterflyGenerator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.props.type).toBe('butterfly');
      expect(result.props.title.mainTitle.text).toBe("人口年龄结构蝴蝶图");
      expect(result.pipe).toBe('key_value');

      // 验证数据映射（Y轴分类 + 左右X轴数值）
      expect(result.props.map).toHaveLength(3);
      expect(result.props.map[0].name).toBe("Y轴对象");
      expect(result.props.map[0].yAxisIndex).toBe(0);
      expect(result.props.map[1].name).toBe("左值");
      expect(result.props.map[1].xAxisIndex).toBe(0);
      expect(result.props.map[2].name).toBe("右值");
      expect(result.props.map[2].xAxisIndex).toBe(1);

      // 验证双轴配置
      expect(result.props.axis.xAxis).toHaveLength(2);
      expect(result.props.axis.xAxis[0].inverse).toBe(true); // 左侧反向
      expect(result.props.axis.yAxis[0].position).toBe('center'); // Y轴居中

      // 验证蝴蝶特有配置
      expect(result.props.display.butterfly).toBeDefined();
      expect(result.props.display.butterfly.centerGap).toBe(10);
      expect(result.props.display.butterfly.symmetrical).toBe(true);
    });

    it('应该正确处理自定义颜色和配置', async () => {
      const input = {
        data: [
          [
            ["分类", "左", "右"],
            ["A", 100, 120],
            ["B", 80, 90]
          ]
        ],
        colors: ['#FF0000', '#0000FF'],
        centerGap: 20,
        symmetrical: false,
        chartType: 'butterfly' as const
      };

      const result = await butterflyGenerator.generateConfig(input);

      expect(result.props.fill.props[0].color.color).toBe('#FF0000');
      expect(result.props.fill.props[1].color.color).toBe('#0000FF');
      expect(result.props.display.butterfly.centerGap).toBe(20);
      expect(result.props.display.butterfly.symmetrical).toBe(false);
    });
  });

  describe('生成器注册', () => {
    it('应该能够注册到图表工具注册表', () => {
      chartToolRegistry.register(riverAreaGenerator);
      chartToolRegistry.register(cascadedAreaGenerator);
      chartToolRegistry.register(butterflyGenerator);

      expect(chartToolRegistry.isRegistered('river-area')).toBe(true);
      expect(chartToolRegistry.isRegistered('cascaded-area')).toBe(true);
      expect(chartToolRegistry.isRegistered('butterfly')).toBe(true);
      
      expect(chartToolRegistry.get('river-area')).toBe(riverAreaGenerator);
      expect(chartToolRegistry.get('cascaded-area')).toBe(cascadedAreaGenerator);
      expect(chartToolRegistry.get('butterfly')).toBe(butterflyGenerator);
    });
  });

  describe('Schema验证', () => {
    it('河流面积图应该通过输入验证', () => {
      const validInput = {
        data: [
          [
            ["时间", "系列1", "系列2"],
            ["2020", 100, 200],
            ["2021", 150, 250]
          ]
        ],
        chartType: 'river-area' as const
      };

      expect(() => riverAreaGenerator.getInputSchema().parse(validInput)).not.toThrow();
    });

    it('层叠面积图应该通过输入验证', () => {
      const validInput = {
        data: [
          [
            ["时间", "A", "B"],
            ["2020", 100, 200],
            ["2021", 150, 250]
          ]
        ],
        chartType: 'cascaded-area' as const
      };

      expect(() => cascadedAreaGenerator.getInputSchema().parse(validInput)).not.toThrow();
    });

    it('蝴蝶图应该通过输入验证', () => {
      const validInput = {
        data: [
          [
            ["分类", "左值", "右值"],
            ["A", 100, 120],
            ["B", 80, 90]
          ]
        ],
        chartType: 'butterfly' as const
      };

      expect(() => butterflyGenerator.getInputSchema().parse(validInput)).not.toThrow();
    });

    it('应该拒绝无效的数据格式', () => {
      const invalidInput = {
        data: [], // 空数组
        chartType: 'river-area' as const
      };

      expect(() => riverAreaGenerator.getInputSchema().parse(invalidInput)).toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该处理空数据', async () => {
      const input = {
        data: [],
        chartType: 'river-area' as const
      };

      await expect(riverAreaGenerator.generateConfig(input)).rejects.toThrow();
    });

    it('应该处理无效的透明度值', () => {
      const input = {
        data: [
          [
            ["时间", "A"],
            ["2020", 100]
          ]
        ],
        areaOpacity: 1.5, // 超出范围
        chartType: 'river-area' as const
      };

      expect(() => riverAreaGenerator.getInputSchema().parse(input)).toThrow();
    });

    it('应该处理无效的间隔距离', () => {
      const input = {
        data: [
          [
            ["分类", "左", "右"],
            ["A", 100, 120]
          ]
        ],
        centerGap: 60, // 超出范围
        chartType: 'butterfly' as const
      };

      expect(() => butterflyGenerator.getInputSchema().parse(input)).toThrow();
    });
  });
}); 