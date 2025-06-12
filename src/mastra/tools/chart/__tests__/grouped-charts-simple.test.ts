import { describe, it, expect } from 'vitest';
import { GroupedColumnChartGenerator } from '../generators/grouped-column-chart.generator';
import { GroupedBarChartGenerator } from '../generators/grouped-bar-chart.generator';

describe('Grouped Charts Generators - Basic Tests', () => {
  describe('GroupedColumnChartGenerator', () => {
    it('should create generator with correct chart type', () => {
      const generator = new GroupedColumnChartGenerator();
      expect(generator.getChartType()).toBe('grouped-column');
    });

    it('should validate correct multi-series data', () => {
      const generator = new GroupedColumnChartGenerator();
      const validData = [
        ["省份", "北京市", "上海市", "广州市", "深圳市"],
        ["2008", 12418, 8195, 9123, 12665],
        ["2010", 17782, 14464, 11921, 19170]
      ];

      expect(generator.validateData(validData)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      const generator = new GroupedColumnChartGenerator();
      
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

    it('should provide correct chart metadata', () => {
      const generator = new GroupedColumnChartGenerator();
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
    it('should create generator with correct chart type', () => {
      const generator = new GroupedBarChartGenerator();
      expect(generator.getChartType()).toBe('grouped-bar');
    });

    it('should provide correct metadata for bar chart', () => {
      const generator = new GroupedBarChartGenerator();
      const metadata = generator.getChartMetadata();
      
      expect(metadata.type).toBe('grouped-bar');
      expect(metadata.name).toBe('分组条形图');
      expect(metadata.category).toBe('bar');
      expect(metadata.features).toContain('horizontal-comparison');
    });
  });
}); 