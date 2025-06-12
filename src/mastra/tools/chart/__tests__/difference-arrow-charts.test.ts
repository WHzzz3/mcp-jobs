import { describe, it, expect, beforeEach } from 'vitest';
import { DifferenceArrowColumnChartGenerator } from '../generators/difference-arrow-column-chart.generator';
import { DifferenceArrowBarChartGenerator } from '../generators/difference-arrow-bar-chart.generator';
import { chartToolRegistry } from '../utils/chart-tool-factory';

describe('差异箭头图表生成器', () => {
  let columnGenerator: DifferenceArrowColumnChartGenerator;
  let barGenerator: DifferenceArrowBarChartGenerator;

  beforeEach(() => {
    columnGenerator = new DifferenceArrowColumnChartGenerator();
    barGenerator = new DifferenceArrowBarChartGenerator();
  });

  describe('DifferenceArrowColumnChartGenerator', () => {
    it('应该正确初始化', () => {
      expect(columnGenerator.getChartType()).toBe('difference-arrow-column');
    });

    it('应该生成有效的差异箭头柱状图配置', async () => {
      const input = {
        data: [
          [
            ["收支项", "2021年", "2020年"],
            ["硬件收入", 1400, 1100],
            ["软件收入", 1300, 1000],
            ["运维成本", 200, 250],
            ["营销成本", 300, 150]
          ]
        ],
        title: "收支对比图",
        subtitle: "2021年vs2020年",
        chartType: 'difference-arrow-column' as const
      };

      const result = await columnGenerator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.props.type).toBe('difference-arrow-column');
      expect(result.props.title.mainTitle.text).toBe("收支对比图");
      expect(result.props.title.subTitle.text).toBe("2021年vs2020年");
      expect(result.data).toEqual(input.data);
      expect(result.pipe).toBe('key_value');

      // 验证数据映射
      expect(result.props.map).toHaveLength(3);
      expect(result.props.map[0].name).toBe("X轴对象");
      expect(result.props.map[1].name).toBe("基数");
      expect(result.props.map[2].name).toBe("对比数");

      // 验证箭头配置
      expect(result.props.display.arrow).toBeDefined();
      expect(result.props.display.arrow.growthArrowColor.color).toBe('#62D9AD');
      expect(result.props.display.arrow.decreaseArrowColor.color).toBe('#E65A56');
    });

    it('应该正确处理自定义箭头颜色', async () => {
      const input = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120],
            ["B项目", 200, 180]
          ]
        ],
        arrowColors: {
          growth: '#00FF00',
          decrease: '#FF0000'
        },
        chartType: 'difference-arrow-column' as const
      };

      const result = await columnGenerator.generateConfig(input);

      expect(result.props.display.arrow.growthArrowColor.color).toBe('#00FF00');
      expect(result.props.display.arrow.decreaseArrowColor.color).toBe('#FF0000');
    });

    it('应该正确处理标签配置', async () => {
      const input = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120]
          ]
        ],
        showLabels: true,
        showArrowLabels: true,
        chartType: 'difference-arrow-column' as const
      };

      const result = await columnGenerator.generateConfig(input);

      expect(result.props.label.show).toBe(true);
      expect(result.props.label.barLabel.show).toBe(true);
      expect(result.props.label.arrowLabel.show).toBe(true);
    });
  });

  describe('DifferenceArrowBarChartGenerator', () => {
    it('应该正确初始化', () => {
      expect(barGenerator.getChartType()).toBe('difference-arrow-bar');
    });

    it('应该生成有效的差异箭头条形图配置', async () => {
      const input = {
        data: [
          [
            ["收支项", "2021年", "2020年"],
            ["硬件收入", 1400, 1100],
            ["软件收入", 1300, 1000],
            ["运维成本", 200, 250],
            ["营销成本", 300, 150]
          ]
        ],
        title: "收支对比图",
        subtitle: "2021年vs2020年",
        chartType: 'difference-arrow-bar' as const
      };

      const result = await barGenerator.generateConfig(input);

      expect(result).toBeDefined();
      expect(result.props.type).toBe('difference-arrow-bar');
      expect(result.props.title.mainTitle.text).toBe("收支对比图");
      expect(result.props.title.subTitle.text).toBe("2021年vs2020年");

      // 验证数据映射（条形图的轴配置与柱状图相反）
      expect(result.props.map).toHaveLength(3);
      expect(result.props.map[0].name).toBe("Y轴对象");
      expect(result.props.map[0].yAxisIndex).toBe(0);
      expect(result.props.map[1].xAxisIndex).toBe(0);
      expect(result.props.map[2].xAxisIndex).toBe(0);

      // 验证坐标轴配置
      expect(result.props.axis.xAxis[0].type).toBe('value');
      expect(result.props.axis.yAxis[0].type).toBe('category');
    });

    it('应该正确处理条形高度配置', async () => {
      const input = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120]
          ]
        ],
        barHeight: 0.5,
        chartType: 'difference-arrow-bar' as const
      };

      const result = await barGenerator.generateConfig(input);

      expect(result.props.display.bar.widthPercent).toBe(0.5);
    });
  });

  describe('生成器注册', () => {
    it('应该能够注册到图表工具注册表', () => {
      chartToolRegistry.register(columnGenerator);
      chartToolRegistry.register(barGenerator);

      expect(chartToolRegistry.isRegistered('difference-arrow-column')).toBe(true);
      expect(chartToolRegistry.isRegistered('difference-arrow-bar')).toBe(true);
      expect(chartToolRegistry.get('difference-arrow-column')).toBe(columnGenerator);
      expect(chartToolRegistry.get('difference-arrow-bar')).toBe(barGenerator);
    });
  });

  describe('Schema验证', () => {
    it('差异箭头柱状图应该通过输入验证', () => {
      const validInput = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120]
          ]
        ],
        chartType: 'difference-arrow-column' as const
      };

      expect(() => columnGenerator.getInputSchema().parse(validInput)).not.toThrow();
    });

    it('差异箭头条形图应该通过输入验证', () => {
      const validInput = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120]
          ]
        ],
        chartType: 'difference-arrow-bar' as const
      };

      expect(() => barGenerator.getInputSchema().parse(validInput)).not.toThrow();
    });

    it('应该拒绝无效的数据格式', () => {
      const invalidInput = {
        data: [], // 空数组
        chartType: 'difference-arrow-column' as const
      };

      expect(() => columnGenerator.getInputSchema().parse(invalidInput)).toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该处理空数据', async () => {
      const input = {
        data: [],
        chartType: 'difference-arrow-column' as const
      };

      await expect(columnGenerator.generateConfig(input)).rejects.toThrow();
    });

    it('应该处理无效的条形高度', () => {
      const input = {
        data: [
          [
            ["项目", "基数", "对比"],
            ["A项目", 100, 120]
          ]
        ],
        barHeight: 1.5, // 超出范围
        chartType: 'difference-arrow-bar' as const
      };

      expect(() => barGenerator.getInputSchema().parse(input)).toThrow();
    });
  });
}); 