import { describe, it, expect, beforeAll } from 'vitest';
import { SchemaMerger } from '../utils/schema-merger';
import path from 'path';
import fs from 'fs/promises';

describe('Mixed Charts Schema Tests', () => {
  let schemaMerger: SchemaMerger;
  let mixedLineStackedColumnSchema: any;
  let mixedLineGroupedColumnSchema: any;
  let mixedLineStackedColumnSample: any;
  let mixedLineGroupedColumnSample: any;

  beforeAll(async () => {
    schemaMerger = new SchemaMerger();
    
    // 加载合并后的schemas
    mixedLineStackedColumnSchema = await schemaMerger.getMergedSchema('mixed-line-stacked-column');
    mixedLineGroupedColumnSchema = await schemaMerger.getMergedSchema('mixed-line-grouped-column');
    
    // 加载sample配置文件
    const configsDir = path.join(__dirname, '../configs');
    const mixedLineStackedColumnSamplePath = path.join(configsDir, 'mixed-line-stacked-column.sample.json');
    const mixedLineGroupedColumnSamplePath = path.join(configsDir, 'mixed-line-grouped-column.sample.json');
    
    mixedLineStackedColumnSample = JSON.parse(await fs.readFile(mixedLineStackedColumnSamplePath, 'utf-8'));
    mixedLineGroupedColumnSample = JSON.parse(await fs.readFile(mixedLineGroupedColumnSamplePath, 'utf-8'));
  });

  describe('Schema Loading', () => {
    it('应该成功加载所有混合图表的schema', () => {
      expect(mixedLineStackedColumnSchema).toBeDefined();
      expect(mixedLineGroupedColumnSchema).toBeDefined();
    });

    it('所有schema应该有正确的基本结构', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        expect(schema.properties).toBeDefined();
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.pipe).toBeDefined();
        expect(schema.properties.props).toBeDefined();
      });
    });
  });

  describe('Mixed Line + Stacked Column Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(mixedLineStackedColumnSchema.properties.props.properties.type.const).toBe('mixed-line-stacked-column');
    });

    it('应该有正确的管道配置', () => {
      expect(mixedLineStackedColumnSchema.properties.pipe.default).toBe('cross');
    });

    it('应该包含必要的配置项', () => {
      const props = mixedLineStackedColumnSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
      expect(props.legend).toBeDefined();
      expect(props.axis).toBeDefined();
    });

    it('应该支持线条和柱状元素类型', () => {
      const mapItems = mixedLineStackedColumnSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('bar');
      expect(mapItems.properties.type.enum).toContain('line');
    });

    it('应该有双显示配置', () => {
      const display = mixedLineStackedColumnSchema.properties.props.properties.display.properties;
      expect(display.line).toBeDefined();
      expect(display.bar).toBeDefined();
    });

    it('应该支持双轴配置', () => {
      const axis = mixedLineStackedColumnSchema.properties.props.properties.axis;
      expect(axis.properties.xAxis).toBeDefined();
      expect(axis.properties.yAxis).toBeDefined();
      expect(axis.properties.xAxis.type).toBe('array');
      expect(axis.properties.yAxis.type).toBe('array');
    });

    it('应该有完整的线条显示配置', () => {
      const lineDisplay = mixedLineStackedColumnSchema.properties.props.properties.display.properties.line.properties;
      expect(lineDisplay.type).toBeDefined();
      expect(lineDisplay.width).toBeDefined();
      expect(lineDisplay.endPoint).toBeDefined();
    });

    it('应该有完整的柱状显示配置', () => {
      const barDisplay = mixedLineStackedColumnSchema.properties.props.properties.display.properties.bar.properties;
      expect(barDisplay.widthPercent).toBeDefined();
      expect(barDisplay.border).toBeDefined();
    });

    it('sample配置应该符合schema要求', () => {
      expect(mixedLineStackedColumnSample.props.type).toBe('mixed-line-stacked-column');
      expect(mixedLineStackedColumnSample.pipe).toBe('cross');
      expect(Array.isArray(mixedLineStackedColumnSample.data)).toBe(true);
      expect(Array.isArray(mixedLineStackedColumnSample.props.map)).toBe(true);
    });
  });

  describe('Mixed Line + Grouped Column Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(mixedLineGroupedColumnSchema.properties.props.properties.type.const).toBe('mixed-line-grouped-column');
    });

    it('应该有正确的管道配置', () => {
      expect(mixedLineGroupedColumnSchema.properties.pipe.default).toBe('cross');
    });

    it('应该包含必要的配置项', () => {
      const props = mixedLineGroupedColumnSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
      expect(props.legend).toBeDefined();
      expect(props.axis).toBeDefined();
    });

    it('应该支持线条和柱状元素类型', () => {
      const mapItems = mixedLineGroupedColumnSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('bar');
      expect(mapItems.properties.type.enum).toContain('line');
    });

    it('应该有双显示配置', () => {
      const display = mixedLineGroupedColumnSchema.properties.props.properties.display.properties;
      expect(display.line).toBeDefined();
      expect(display.bar).toBeDefined();
    });

    it('应该支持双轴配置', () => {
      const axis = mixedLineGroupedColumnSchema.properties.props.properties.axis;
      expect(axis.properties.xAxis).toBeDefined();
      expect(axis.properties.yAxis).toBeDefined();
      expect(axis.properties.xAxis.type).toBe('array');
      expect(axis.properties.yAxis.type).toBe('array');
    });

    it('应该有分组柱状特定配置', () => {
      const barDisplay = mixedLineGroupedColumnSchema.properties.props.properties.display.properties.bar.properties;
      expect(barDisplay.widthPercent).toBeDefined();
      expect(barDisplay.border).toBeDefined();
    });

    it('sample配置应该符合schema要求', () => {
      expect(mixedLineGroupedColumnSample.props.type).toBe('mixed-line-grouped-column');
      expect(mixedLineGroupedColumnSample.pipe).toBe('cross');
      expect(Array.isArray(mixedLineGroupedColumnSample.data)).toBe(true);
      expect(Array.isArray(mixedLineGroupedColumnSample.props.map)).toBe(true);
    });
  });

  describe('Cross-Chart Consistency', () => {
    it('所有混合图表应该使用相同的管道类型', () => {
      expect(mixedLineStackedColumnSchema.properties.pipe.default).toBe('cross');
      expect(mixedLineGroupedColumnSchema.properties.pipe.default).toBe('cross');
    });

    it('所有混合图表应该引用相同的common schema定义', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const props = schema.properties.props.properties;
        expect(props.title).toBeDefined();
        expect(props.background).toBeDefined();
        expect(props.legend).toBeDefined();
      });
    });

    it('所有混合图表都应该有正确的数据格式', () => {
      [mixedLineStackedColumnSample, mixedLineGroupedColumnSample].forEach(sample => {
        expect(Array.isArray(sample.data)).toBe(true);
        expect(sample.data.length).toBeGreaterThan(0);
        const actualData = sample.data[0] || sample.data;
        expect(Array.isArray(actualData)).toBe(true);
        if (Array.isArray(actualData[0])) {
          expect(actualData.length).toBeGreaterThan(1);
        }
      });
    });

    it('所有混合图表应该支持多元素类型', () => {
      [mixedLineStackedColumnSample, mixedLineGroupedColumnSample].forEach(sample => {
        const elementTypes = sample.props.map.map((item: any) => item.type);
        expect(elementTypes).toContain('line');
        expect(elementTypes).toContain('bar');
      });
    });
  });

  describe('Axis Configuration', () => {
    it('应该支持多X轴配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const xAxisConfig = schema.properties.props.properties.axis.properties.xAxis;
        expect(xAxisConfig.type).toBe('array');
        expect(xAxisConfig.items.properties.line).toBeDefined();
        expect(xAxisConfig.items.properties.label).toBeDefined();
        expect(xAxisConfig.items.properties.grid).toBeDefined();
      });
    });

    it('应该支持多Y轴配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const yAxisConfig = schema.properties.props.properties.axis.properties.yAxis;
        expect(yAxisConfig.type).toBe('array');
        expect(yAxisConfig.items.properties.line).toBeDefined();
        expect(yAxisConfig.items.properties.label).toBeDefined();
        expect(yAxisConfig.items.properties.grid).toBeDefined();
      });
    });

    it('轴配置应该有适当的约束', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const xAxisConfig = schema.properties.props.properties.axis.properties.xAxis;
        const yAxisConfig = schema.properties.props.properties.axis.properties.yAxis;
        
        expect(xAxisConfig.minItems).toBe(1);
        expect(xAxisConfig.maxItems).toBe(1);
        expect(yAxisConfig.minItems).toBe(2);
        expect(yAxisConfig.maxItems).toBe(2);
      });
    });
  });

  describe('Display Configuration', () => {
    it('线条配置应该支持多种类型', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const lineType = schema.properties.props.properties.display.properties.line.properties.type;
        expect(lineType.enum).toContain('straight');
        expect(lineType.enum).toContain('curve');
        expect(lineType.enum.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('柱状配置应该有完整的属性', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const barProps = schema.properties.props.properties.display.properties.bar.properties;
        expect(barProps.widthPercent).toBeDefined();
        expect(barProps.border).toBeDefined();
        expect(barProps.border.properties.radius).toBeDefined();
      });
    });

    it('应该有端点配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const endPoint = schema.properties.props.properties.display.properties.line.properties.endPoint;
        expect(endPoint.properties.radius).toBeDefined();
        expect(endPoint.properties.width).toBeDefined();
        expect(endPoint.properties.color).toBeDefined();
        expect(endPoint.properties.fill).toBeDefined();
      });
    });
  });

  describe('Schema Integration', () => {
    it('应该能通过SchemaMerger正确加载和合并schema', async () => {
      const merger = new SchemaMerger();
      
      const lineStackedSchema = await merger.getMergedSchema('mixed-line-stacked-column');
      const lineGroupedSchema = await merger.getMergedSchema('mixed-line-grouped-column');
      
      expect(lineStackedSchema).toBeDefined();
      expect(lineGroupedSchema).toBeDefined();
    });

    it('合并后的schema应该有完整的定义', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.props.properties.title).toBeDefined();
        expect(schema.properties.props.properties.background).toBeDefined();
        expect(schema.properties.props.properties.fill).toBeDefined();
        expect(schema.properties.props.properties.display).toBeDefined();
        expect(schema.properties.props.properties.axis).toBeDefined();
      });
    });
  });

  describe('Data Format Validation', () => {
    it('应该有多系列数据格式', () => {
      [mixedLineStackedColumnSample, mixedLineGroupedColumnSample].forEach(sample => {
        expect(sample.props.map.length).toBeGreaterThan(2);
        const valueColumns = sample.props.map.filter((item: any) => item.function === 'vCol');
        expect(valueColumns.length).toBeGreaterThan(1);
      });
    });

    it('应该有混合元素类型映射', () => {
      [mixedLineStackedColumnSample, mixedLineGroupedColumnSample].forEach(sample => {
        const lineItems = sample.props.map.filter((item: any) => item.type === 'line');
        const barItems = sample.props.map.filter((item: any) => item.type === 'bar');
        
        expect(lineItems.length).toBeGreaterThan(0);
        expect(barItems.length).toBeGreaterThan(0);
      });
    });

    it('应该有轴索引分配', () => {
      [mixedLineStackedColumnSample, mixedLineGroupedColumnSample].forEach(sample => {
        sample.props.map.forEach((item: any) => {
          if (item.function === 'vCol') {
            expect(typeof item.yAxisIndex).toBe('number');
          }
          if (item.function === 'objCol') {
            expect(typeof item.xAxisIndex).toBe('number');
          }
        });
      });
    });
  });

  describe('Fill and Style Configuration', () => {
    it('应该支持多种填充控制类型', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const fillControlType = schema.properties.props.properties.fill.properties.controlType;
        expect(fillControlType.enum).toContain('single');
        expect(fillControlType.enum).toContain('multiple');
        expect(fillControlType.enum).toContain('gradient');
      });
    });

    it('应该有完整的阴影和边框配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const fillProps = schema.properties.props.properties.fill.properties.props.items.properties;
        expect(fillProps.color).toBeDefined();
        expect(fillProps.shadow).toBeDefined();
        expect(fillProps.border).toBeDefined();
        
        const shadowProps = fillProps.shadow.properties;
        expect(shadowProps.show).toBeDefined();
        expect(shadowProps.type).toBeDefined();
        expect(shadowProps.angle).toBeDefined();
        expect(shadowProps.blur).toBeDefined();
      });
    });
  });

  describe('Validation Constraints', () => {
    it('应该有适当的数值约束', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const lineWidth = schema.properties.props.properties.display.properties.line.properties.width;
        expect(lineWidth.minimum).toBe(0);
        
        const barWidthPercent = schema.properties.props.properties.display.properties.bar.properties.widthPercent;
        expect(barWidthPercent.minimum).toBe(0.01);
        expect(barWidthPercent.maximum).toBe(1);
      });
    });

    it('应该有合理的默认值', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        expect(schema.properties.pipe.default).toBe('cross');
        
        const lineType = schema.properties.props.properties.display.properties.line.properties.type;
        expect(lineType.default).toBeDefined();
        
        const lineWidth = schema.properties.props.properties.display.properties.line.properties.width;
        expect(lineWidth.default).toBeDefined();
      });
    });
  });

  describe('Advanced Features', () => {
    it('应该支持标签配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const label = schema.properties.props.properties.label;
        expect(label).toBeDefined();
        expect(label.properties.show).toBeDefined();
        expect(label.properties.lineLabel).toBeDefined();
        expect(label.properties.barLabel).toBeDefined();
      });
    });

    it('应该支持图例配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const legend = schema.properties.props.properties.legend;
        expect(legend).toBeDefined();
      });
    });

    it('应该有完整的必需字段配置', () => {
      [mixedLineStackedColumnSchema, mixedLineGroupedColumnSchema].forEach(schema => {
        const mapRequired = schema.properties.props.properties.map.items.required;
        expect(mapRequired).toContain('name');
        expect(mapRequired).toContain('index');
        expect(mapRequired).toContain('type');
        expect(mapRequired).toContain('function');
      });
    });
  });
}); 