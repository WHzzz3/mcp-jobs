import { describe, it, expect } from 'vitest';
import { RosePieChartGenerator } from '../generators/rose-pie-chart.generator';
import { JadeJueChartGenerator } from '../generators/jade-jue-chart.generator';

describe('Special Pie Charts Generators', () => {
  describe('RosePieChartGenerator', () => {
    it('should create generator with correct chart type', () => {
      const generator = new RosePieChartGenerator();
      expect(generator.getChartType()).toBe('rose-pie');
    });

    it('should validate correct key-value data', () => {
      const generator = new RosePieChartGenerator();
      const validData = [
        ["国家", 96],
        ["德国", 121],
        ["美国", 100],
        ["日本", 111]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      const generator = new RosePieChartGenerator();
      
      // 空数据
      expect(generator.validateData([])).toBe(false);
      
      // 数据格式错误
      const invalidData = [
        ["国家", "德国", "美国"], // 不是键值对
        ["96", 121, 100] // 第一列不是字符串
      ];
      expect(generator.validateData(invalidData)).toBe(false);
    });

    it('should provide correct chart metadata', () => {
      const generator = new RosePieChartGenerator();
      const metadata = generator.getChartMetadata();
      
      expect(metadata.type).toBe('rose-pie');
      expect(metadata.name).toBe('玫瑰图');
      expect(metadata.category).toBe('pie');
      expect(metadata.dataFormat).toBe('key_value');
      expect(metadata.features).toContain('polar-coordinates');
      expect(metadata.features).toContain('radius-mapping');
    });
  });

  describe('JadeJueChartGenerator', () => {
    it('should create generator with correct chart type', () => {
      const generator = new JadeJueChartGenerator();
      expect(generator.getChartType()).toBe('jade-jue');
    });

    it('should validate correct key-value data', () => {
      const generator = new JadeJueChartGenerator();
      const validData = [
        ["电子商务", 16.2],
        ["网络金融", 15.6],
        ["文化娱乐", 11.7],
        ["汽车交通", 10.4]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('should provide correct metadata for jade-jue chart', () => {
      const generator = new JadeJueChartGenerator();
      const metadata = generator.getChartMetadata();
      
      expect(metadata.type).toBe('jade-jue');
      expect(metadata.name).toBe('玉玦图');
      expect(metadata.category).toBe('pie');
      expect(metadata.features).toContain('partial-circle');
      expect(metadata.features).toContain('jade-shape');
    });
  });

  describe('Data Format Consistency', () => {
    it('should both generators use key_value data format', () => {
      const roseGenerator = new RosePieChartGenerator();
      const jadeGenerator = new JadeJueChartGenerator();

      const roseMeta = roseGenerator.getChartMetadata();
      const jadeMeta = jadeGenerator.getChartMetadata();

      expect(roseMeta.dataFormat).toBe('key_value');
      expect(jadeMeta.dataFormat).toBe('key_value');
    });

    it('should both generators be categorized as pie charts', () => {
      const roseGenerator = new RosePieChartGenerator();
      const jadeGenerator = new JadeJueChartGenerator();

      const roseMeta = roseGenerator.getChartMetadata();
      const jadeMeta = jadeGenerator.getChartMetadata();

      expect(roseMeta.category).toBe('pie');
      expect(jadeMeta.category).toBe('pie');
    });
  });
}); 