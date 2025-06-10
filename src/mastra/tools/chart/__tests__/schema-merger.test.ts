import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaMerger } from '../utils/schema-merger';

describe('SchemaMerger', () => {
  let schemaMerger: SchemaMerger;

  beforeEach(() => {
    schemaMerger = new SchemaMerger();
    schemaMerger.clearCache(); // 确保每次测试都是干净状态
  });

  describe('getAvailableChartTypes', () => {
    it('should return available chart types', () => {
      const chartTypes = schemaMerger.getAvailableChartTypes();
      
      expect(chartTypes).toBeInstanceOf(Array);
      expect(chartTypes.length).toBeGreaterThan(0);
      
      // 验证包含一些已知的图表类型
      expect(chartTypes).toContain('bar-progress');
      expect(chartTypes).toContain('basic-bar');
      expect(chartTypes).toContain('basic-pie');
      
      // 确保不包含 common schema
      expect(chartTypes).not.toContain('common');
    });
  });

  describe('mergeSchemas', () => {
    it('should successfully merge schemas for bar-progress chart', () => {
      const mergedSchema = schemaMerger.mergeSchemas('bar-progress');
      
      // 验证基本结构
      expect(mergedSchema).toBeDefined();
      expect(mergedSchema.type).toBe('object');
      expect(mergedSchema.properties).toBeDefined();
      expect(mergedSchema.definitions).toBeDefined();
      
      // 验证必需的字段
      expect(mergedSchema.properties!.data).toBeDefined();
      expect(mergedSchema.properties!.props).toBeDefined();
      expect(mergedSchema.properties!.pipe).toBeDefined();
    });

    it('should resolve common schema references correctly', () => {
      const mergedSchema = schemaMerger.mergeSchemas('bar-progress');
      
      // 验证引用已被解析
      const titleConfig = mergedSchema.properties?.props?.properties?.title;
      expect(titleConfig).toBeDefined();
      
      // title 应该是完整的配置对象，而不是引用
      expect(titleConfig.$ref).toBeUndefined();
      expect(titleConfig.type).toBe('object');
      expect(titleConfig.properties).toBeDefined();
    });

    it('should handle different chart types', () => {
      const chartTypes = ['bar-progress', 'basic-bar', 'basic-pie'];
      
      chartTypes.forEach(chartType => {
        const mergedSchema = schemaMerger.mergeSchemas(chartType);
        
        expect(mergedSchema).toBeDefined();
        expect(mergedSchema.properties?.props?.properties?.type?.const).toBe(chartType);
      });
    });

    it('should throw error for non-existent chart type', () => {
      expect(() => {
        schemaMerger.mergeSchemas('non-existent-chart');
      }).toThrow();
    });
  });

  describe('validateMergedSchema', () => {
    it('should validate correct schemas as valid', () => {
      const isValid = schemaMerger.validateMergedSchema('bar-progress');
      expect(isValid).toBe(true);
    });

    it('should validate multiple chart types', () => {
      const chartTypes = ['bar-progress', 'basic-bar', 'basic-pie'];
      
      chartTypes.forEach(chartType => {
        const isValid = schemaMerger.validateMergedSchema(chartType);
        expect(isValid).toBe(true);
      });
    });

    it('should return false for invalid chart type', () => {
      const isValid = schemaMerger.validateMergedSchema('invalid-chart-type');
      expect(isValid).toBe(false);
    });
  });

  describe('getMergedSchema', () => {
    it('should return the same result as mergeSchemas', () => {
      const chartType = 'bar-progress';
      const mergedSchema1 = schemaMerger.mergeSchemas(chartType);
      const mergedSchema2 = schemaMerger.getMergedSchema(chartType);
      
      expect(mergedSchema1).toEqual(mergedSchema2);
    });
  });

  describe('cache functionality', () => {
    it('should cache common schema for performance', () => {
      // 第一次调用
      const schema1 = schemaMerger.mergeSchemas('bar-progress');
      
      // 第二次调用应该使用缓存
      const schema2 = schemaMerger.mergeSchemas('basic-bar');
      
      expect(schema1).toBeDefined();
      expect(schema2).toBeDefined();
    });

    it('should clear cache when requested', () => {
      schemaMerger.mergeSchemas('bar-progress');
      schemaMerger.clearCache();
      
      // 应该能够重新加载
      const schema = schemaMerger.mergeSchemas('bar-progress');
      expect(schema).toBeDefined();
    });
  });

  describe('reference resolution', () => {
    it('should resolve nested references correctly', () => {
      const mergedSchema = schemaMerger.mergeSchemas('bar-progress');
      
      // 检查嵌套的颜色引用是否被正确解析
      const fillProps = mergedSchema.properties?.props?.properties?.fill?.properties?.props;
      expect(fillProps).toBeDefined();
      
      if (fillProps?.items?.properties?.color) {
        const colorRef = fillProps.items.properties.color;
        // 颜色引用应该被解析为完整的 oneOf 结构
        expect(colorRef.oneOf).toBeDefined();
        expect(Array.isArray(colorRef.oneOf)).toBe(true);
      }
    });

    it('should handle references to definitions that have their own references', () => {
      const mergedSchema = schemaMerger.mergeSchemas('basic-bar');
      
      // 验证复杂的引用结构被正确解析
      expect(mergedSchema.definitions).toBeDefined();
      expect(Object.keys(mergedSchema.definitions!).length).toBeGreaterThan(0);
    });
  });
}); 