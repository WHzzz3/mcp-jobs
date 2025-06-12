import { describe, it, expect, beforeEach } from 'vitest';
import { CheckInBubbleChartGenerator } from '../generators/check-in-bubble-chart.generator';
import { ComposeWaterfallChartGenerator } from '../generators/compose-waterfall-chart.generator';

describe('New Chart Generators', () => {
  describe('CheckInBubbleChartGenerator', () => {
    let generator: CheckInBubbleChartGenerator;
    const sampleData = [
      ['星期', '时间段', '签到人数'],
      ['周一', '9:00', 120],
      ['周一', '12:00', 85],
      ['周二', '9:00', 130],
    ];

    beforeEach(() => {
      generator = new CheckInBubbleChartGenerator();
    });

    it('should create generator with correct chart type', () => {
      expect(generator.getChartType()).toBe('check-in-bubble');
    });

    it('should generate basic check-in bubble chart configuration', async () => {
      const input = {
        data: sampleData,
        chartType: 'check-in-bubble' as const,
        title: '签到气泡图测试'
      };

      const result = await generator.generateConfig(input);
      
      expect(result).toBeDefined();
      expect(result.props.type).toBe('check-in-bubble');
      expect(result.props.map).toHaveLength(3);
    });

    it('should reject invalid data formats', async () => {
      const invalidInput = {
        data: [['星期', '时间段'], ['周一', '9:00']], // 只有2列，需要3列
        chartType: 'check-in-bubble' as const
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('签到气泡图需要恰好3列数据');
    });
  });

  describe('ComposeWaterfallChartGenerator', () => {
    let generator: ComposeWaterfallChartGenerator;
    const sampleData = [
      ['阶段', '数值'],
      ['初始值', 100],
      ['增长1', 20],
      ['减少1', -15],
    ];

    beforeEach(() => {
      generator = new ComposeWaterfallChartGenerator();
    });

    it('should create generator with correct chart type', () => {
      expect(generator.getChartType()).toBe('compose-waterfall');
    });

    it('should generate basic waterfall chart configuration', async () => {
      const input = {
        data: sampleData,
        chartType: 'compose-waterfall' as const,
        title: '复合瀑布图测试'
      };

      const result = await generator.generateConfig(input);
      
      expect(result).toBeDefined();
      expect(result.props.type).toBe('compose-waterfall');
      expect(result.props.map).toHaveLength(2);
    });

    it('should reject invalid data formats', async () => {
      const invalidInput = {
        data: [['阶段', '数值', '额外列'], ['初始值', 100, 'extra']], // 3列，需要2列
        chartType: 'compose-waterfall' as const
      };

      await expect(generator.generateConfig(invalidInput))
        .rejects.toThrow('复合瀑布图需要恰好2列数据');
    });
  });
}); 