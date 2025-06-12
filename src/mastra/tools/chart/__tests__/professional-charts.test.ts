import { describe, it, expect, beforeEach } from 'vitest';
import { FunnelChartGenerator } from '../generators/funnel-chart.generator';
import { BasicRadarChartGenerator } from '../generators/basic-radar-chart.generator';
import { DescartesHeatmapChartGenerator } from '../generators/descartes-heatmap-chart.generator';

describe('专业图表生成器', () => {
  describe('漏斗图生成器', () => {
    let generator: FunnelChartGenerator;

    beforeEach(() => {
      generator = new FunnelChartGenerator();
    });

    it('应该正确创建漏斗图生成器', () => {
      expect(generator).toBeInstanceOf(FunnelChartGenerator);
      expect(generator.getChartMetadata().type).toBe('funnel');
    });

    it('应该验证有效的漏斗图数据', () => {
      const validData = [
        ["类型", "值"],
        ["浏览网站", 100],
        ["放入购物车", 70],
        ["生成订单", 60],
        ["支付订单", 40],
        ["完成交易", 20]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('应该拒绝无效的漏斗图数据', () => {
      const invalidData = [
        ["类型", "值"],
        ["浏览网站"] // 缺少数值
      ];

      expect(generator.validateData(invalidData)).toBe(false);
    });

    it('应该返回正确的图表元数据', () => {
      const metadata = generator.getChartMetadata();
      
      expect(metadata.name).toBe('漏斗图');
      expect(metadata.dataFormat).toBe('key_value');
      expect(metadata.category).toBe('特殊图表');
      expect(metadata.tags).toContain('转化');
      expect(metadata.tags).toContain('漏斗');
    });

    it('应该使用正确的元素类型', () => {
      // getElementType是protected方法，通过类型断言访问
      expect((generator as any).getElementType()).toBe('bar');
    });
  });

  describe('基础雷达图生成器', () => {
    let generator: BasicRadarChartGenerator;

    beforeEach(() => {
      generator = new BasicRadarChartGenerator();
    });

    it('应该正确创建基础雷达图生成器', () => {
      expect(generator).toBeInstanceOf(BasicRadarChartGenerator);
      expect(generator.getChartMetadata().type).toBe('basic-radar');
    });

    it('应该验证有效的雷达图数据', () => {
      const validData = [
        ["品牌", "iPhone", "Samsung", "Nokia"],
        ["电池寿命", 22, 27, 26],
        ["品牌价值", 28, 16, 10],
        ["合约费用", 29, 35, 30],
        ["设计与质量", 17, 13, 14],
        ["网络", 22, 20, 22]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('应该拒绝无效的雷达图数据', () => {
      const invalidData = [
        ["品牌", "iPhone", "Samsung"],
        ["电池寿命", 22, "invalid"] // 非数字值
      ];

      expect(generator.validateData(invalidData)).toBe(false);
    });

    it('应该返回正确的图表元数据', () => {
      const metadata = generator.getChartMetadata();
      
      expect(metadata.name).toBe('基础雷达图');
      expect(metadata.dataFormat).toBe('cross');
      expect(metadata.category).toBe('雷达图');
      expect(metadata.tags).toContain('多维');
      expect(metadata.tags).toContain('雷达');
    });

    it('应该使用正确的元素类型', () => {
      // getElementType是protected方法，通过类型断言访问
      expect((generator as any).getElementType()).toBe('area');
    });
  });

  describe('笛卡尔热力图生成器', () => {
    let generator: DescartesHeatmapChartGenerator;

    beforeEach(() => {
      generator = new DescartesHeatmapChartGenerator();
    });

    it('应该正确创建笛卡尔热力图生成器', () => {
      expect(generator).toBeInstanceOf(DescartesHeatmapChartGenerator);
      expect(generator.getChartMetadata().type).toBe('descartes-heatmap');
    });

    it('应该验证有效的热力图数据', () => {
      const validData = [
        ["关键词", "2010", "2011", "2012", "2013"],
        ["改革", 65, 65, 74, 57],
        ["建设", 87, 87, 75, 60],
        ["经济", 71, 71, 76, 74],
        ["政策", 87, 87, 75, 60]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('应该拒绝无效的热力图数据', () => {
      const invalidData = [
        ["关键词", "2010", "2011"],
        ["改革", 65] // 列数不匹配
      ];

      expect(generator.validateData(invalidData)).toBe(false);
    });

    it('应该返回正确的图表元数据', () => {
      const metadata = generator.getChartMetadata();
      
      expect(metadata.name).toBe('笛卡尔热力图');
      expect(metadata.dataFormat).toBe('cross');
      expect(metadata.category).toBe('热力图');
      expect(metadata.tags).toContain('热力图');
      expect(metadata.tags).toContain('二维数据');
    });

    it('应该使用正确的元素类型', () => {
      // getElementType是protected方法，通过类型断言访问
      expect((generator as any).getElementType()).toBe('bar');
    });
  });
}); 