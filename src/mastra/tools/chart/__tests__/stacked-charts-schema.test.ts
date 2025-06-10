import { describe, it, expect, beforeAll } from 'vitest';
import { SchemaMerger } from '../utils/schema-merger';
import path from 'path';
import fs from 'fs/promises';

describe('Stacked Charts Schema Tests', () => {
  let schemaMerger: SchemaMerger;
  let stackedColumnSchema: any;
  let stackedBarSchema: any;
  let stackedAreaSchema: any;
  let stackedColumnSample: any;
  let stackedBarSample: any;
  let stackedAreaSample: any;

  beforeAll(async () => {
    schemaMerger = new SchemaMerger();
    
    // 加载合并后的schemas
    stackedColumnSchema = await schemaMerger.getMergedSchema('stacked-column');
    stackedBarSchema = await schemaMerger.getMergedSchema('stacked-bar');
    stackedAreaSchema = await schemaMerger.getMergedSchema('stacked-area');
    
    // 加载sample配置文件
    const configsDir = path.join(__dirname, '../configs');
    const stackedColumnSamplePath = path.join(configsDir, 'stacked-column.sample.json');
    const stackedBarSamplePath = path.join(configsDir, 'stacked-bar.sample.json');
    const stackedAreaSamplePath = path.join(configsDir, 'stacked-area.sample.json');
    
    stackedColumnSample = JSON.parse(await fs.readFile(stackedColumnSamplePath, 'utf-8'));
    stackedBarSample = JSON.parse(await fs.readFile(stackedBarSamplePath, 'utf-8'));
    stackedAreaSample = JSON.parse(await fs.readFile(stackedAreaSamplePath, 'utf-8'));
  });

  describe('Schema Loading', () => {
    it('应该成功加载所有堆叠图表的schema', () => {
      expect(stackedColumnSchema).toBeDefined();
      expect(stackedBarSchema).toBeDefined();
      expect(stackedAreaSchema).toBeDefined();
    });

    it('所有schema应该有正确的基本结构', () => {
      [stackedColumnSchema, stackedBarSchema, stackedAreaSchema].forEach(schema => {
        expect(schema.properties).toBeDefined();
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.pipe).toBeDefined();
        expect(schema.properties.props).toBeDefined();
      });
    });
  });

  describe('Stacked Column Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(stackedColumnSchema.properties.props.properties.type.const).toBe('stacked-column');
    });

    it('应该有正确的管道配置', () => {
      expect(stackedColumnSchema.properties.pipe.default).toBe('cross');
    });

    it('应该包含必要的配置项', () => {
      const props = stackedColumnSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
      expect(props.legend).toBeDefined();
    });

    it('应该有正确的map配置', () => {
      const mapItems = stackedColumnSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('bar');
      expect(mapItems.required).toContain('name');
      expect(mapItems.required).toContain('index');
      expect(mapItems.required).toContain('type');
    });

    it('应该支持多种填充控制类型', () => {
      const fillControlType = stackedColumnSchema.properties.props.properties.fill.properties.controlType;
      expect(fillControlType.enum).toContain('single');
      expect(fillControlType.enum).toContain('multiple');
      expect(fillControlType.enum).toContain('gradient');
    });

    it('sample配置应该符合schema要求', () => {
      expect(stackedColumnSample.props.type).toBe('stacked-column');
      expect(stackedColumnSample.pipe).toBe('cross');
      expect(Array.isArray(stackedColumnSample.data)).toBe(true);
      expect(Array.isArray(stackedColumnSample.props.map)).toBe(true);
    });
  });

  describe('Stacked Bar Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(stackedBarSchema.properties.props.properties.type.const).toBe('stacked-bar');
    });

    it('应该有正确的管道配置', () => {
      expect(stackedBarSchema.properties.pipe.default).toBe('cross');
    });

    it('应该包含必要的配置项', () => {
      const props = stackedBarSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
      expect(props.legend).toBeDefined();
    });

    it('应该有正确的map配置', () => {
      const mapItems = stackedBarSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('bar');
      expect(mapItems.required).toContain('name');
      expect(mapItems.required).toContain('index');
      expect(mapItems.required).toContain('type');
    });

    it('应该有柱状图特定的显示配置', () => {
      const display = stackedBarSchema.properties.props.properties.display.properties;
      expect(display.bar).toBeDefined();
      expect(display.bar.properties.widthPercent).toBeDefined();
    });

    it('sample配置应该符合schema要求', () => {
      expect(stackedBarSample.props.type).toBe('stacked-bar');
      expect(stackedBarSample.pipe).toBe('cross');
      expect(Array.isArray(stackedBarSample.data)).toBe(true);
      expect(Array.isArray(stackedBarSample.props.map)).toBe(true);
    });
  });

  describe('Stacked Area Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(stackedAreaSchema.properties.props.properties.type.const).toBe('stacked-area');
    });

    it('应该有正确的管道配置', () => {
      expect(stackedAreaSchema.properties.pipe.default).toBe('cross');
    });

    it('应该包含必要的配置项', () => {
      const props = stackedAreaSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
      expect(props.legend).toBeDefined();
    });

    it('应该有正确的map配置', () => {
      const mapItems = stackedAreaSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('area');
      expect(mapItems.required).toContain('name');
      expect(mapItems.required).toContain('index');
      expect(mapItems.required).toContain('type');
    });

    it('应该有面积图特定的显示配置', () => {
      const display = stackedAreaSchema.properties.props.properties.display.properties;
      expect(display.area).toBeDefined();
      expect(display.area.properties.type).toBeDefined();
      expect(display.area.properties.fillOpacity).toBeDefined();
      expect(display.area.properties.endPoint).toBeDefined();
    });

    it('应该有面积图特定的标签配置', () => {
      const label = stackedAreaSchema.properties.props.properties.label.properties;
      expect(label.areaLabel).toBeDefined();
      expect(label.areaLabel.properties.positionChoice).toBeDefined();
    });

    it('sample配置应该符合schema要求', () => {
      expect(stackedAreaSample.props.type).toBe('stacked-area');
      expect(stackedAreaSample.pipe).toBe('cross');
      expect(Array.isArray(stackedAreaSample.data)).toBe(true);
      expect(Array.isArray(stackedAreaSample.props.map)).toBe(true);
    });
  });

  describe('Cross-Chart Consistency', () => {
    it('所有堆叠图表应该使用相同的管道类型', () => {
      expect(stackedColumnSchema.properties.pipe.default).toBe('cross');
      expect(stackedBarSchema.properties.pipe.default).toBe('cross');
      expect(stackedAreaSchema.properties.pipe.default).toBe('cross');
    });

    it('所有堆叠图表应该引用相同的common schema定义', () => {
      [stackedColumnSchema, stackedBarSchema, stackedAreaSchema].forEach(schema => {
        const props = schema.properties.props.properties;
        // 合并后的schema会解析引用，所以检查定义是否存在而不是$ref
        expect(props.title).toBeDefined();
        expect(props.background).toBeDefined();
        expect(props.legend).toBeDefined();
        // 检查这些配置有正确的结构
        expect(props.title.properties || props.title.type).toBeDefined();
        expect(props.background.properties || props.background.type).toBeDefined();
        expect(props.legend.properties || props.legend.type).toBeDefined();
      });
    });

    it('所有堆叠图表应该支持多系列数据', () => {
      [stackedColumnSample, stackedBarSample, stackedAreaSample].forEach(sample => {
        expect(sample.props.map.length).toBeGreaterThan(2); // 至少有一个分类列和多个数值列
        const valueColumns = sample.props.map.filter((item: any) => item.function === 'vCol');
        expect(valueColumns.length).toBeGreaterThan(1); // 多个数值列形成堆叠
      });
    });

    it('所有堆叠图表都应该有正确的数据格式', () => {
      [stackedColumnSample, stackedBarSample, stackedAreaSample].forEach(sample => {
        expect(Array.isArray(sample.data)).toBe(true);
        expect(sample.data.length).toBeGreaterThan(0); // 数据数组存在
        // 检查数据是否被包装在数组中
        const actualData = sample.data[0] || sample.data;
        expect(Array.isArray(actualData)).toBe(true);
        if (Array.isArray(actualData[0])) {
          expect(actualData.length).toBeGreaterThan(1); // 至少有标题行和数据行
        }
      });
    });
  });

  describe('Schema Integration', () => {
    it('应该能通过SchemaMerger正确加载和合并schema', async () => {
      const merger = new SchemaMerger();
      
      const columnSchema = await merger.getMergedSchema('stacked-column');
      const barSchema = await merger.getMergedSchema('stacked-bar');
      const areaSchema = await merger.getMergedSchema('stacked-area');
      
      expect(columnSchema).toBeDefined();
      expect(barSchema).toBeDefined();
      expect(areaSchema).toBeDefined();
    });

    it('合并后的schema应该有完整的定义', () => {
      [stackedColumnSchema, stackedBarSchema, stackedAreaSchema].forEach(schema => {
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.props.properties.title).toBeDefined();
        expect(schema.properties.props.properties.background).toBeDefined();
        expect(schema.properties.props.properties.fill).toBeDefined();
      });
    });
  });

  describe('Data Format Validation', () => {
    it('堆叠柱状图和条形图应该有相似的数据结构', () => {
      const columnData = stackedColumnSample.data;
      const barData = stackedBarSample.data;
      
      expect(columnData.length).toBeGreaterThan(0);
      expect(barData.length).toBeGreaterThan(0);
      expect(columnData[0].length).toEqual(barData[0].length); // 相同的列数
    });

    it('堆叠面积图应该有时间序列数据格式', () => {
      const areaData = stackedAreaSample.data;
      expect(areaData.length).toBeGreaterThan(0);
      // 数据可能被包装在数组中，获取实际数据
      const actualData = areaData[0] || areaData;
      expect(Array.isArray(actualData)).toBe(true);
      expect(actualData.length).toBeGreaterThan(1); // 至少有标题行和数据行
      expect(actualData[0].length).toBeGreaterThan(2); // 至少有时间列和多个数值列
    });

    it('所有样例配置都应该有正确的map配置', () => {
      [stackedColumnSample, stackedBarSample, stackedAreaSample].forEach(sample => {
        expect(Array.isArray(sample.props.map)).toBe(true);
        expect(sample.props.map.length).toBeGreaterThan(1);
        
        // 应该有一个对象列（分类或时间）
        const objCols = sample.props.map.filter((item: any) => item.function === 'objCol');
        expect(objCols.length).toBe(1);
        
        // 应该有多个数值列（用于堆叠）
        const valueCols = sample.props.map.filter((item: any) => item.function === 'vCol');
        expect(valueCols.length).toBeGreaterThan(1);
      });
    });
  });
}); 