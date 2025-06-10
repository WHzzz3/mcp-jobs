import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

describe('Complex Charts Structure Validation', () => {
  let voronoiRawSchema: any;
  let sankeyRawSchema: any;
  let treemapRawSchema: any;
  let commonSchema: any;

  beforeAll(async () => {
    const schemasDir = path.join(__dirname, '../schemas');
    
    // 加载原始schema文件
    const voronoiPath = path.join(schemasDir, 'voronoi.schema.json');
    const sankeyPath = path.join(schemasDir, 'sankey.schema.json');
    const treemapPath = path.join(schemasDir, 'single-layer-treemap.schema.json');
    const commonPath = path.join(schemasDir, 'common.schema.json');
    
    voronoiRawSchema = JSON.parse(await fs.readFile(voronoiPath, 'utf-8'));
    sankeyRawSchema = JSON.parse(await fs.readFile(sankeyPath, 'utf-8'));
    treemapRawSchema = JSON.parse(await fs.readFile(treemapPath, 'utf-8'));
    commonSchema = JSON.parse(await fs.readFile(commonPath, 'utf-8'));
  });

  describe('JSON Schema Metadata', () => {
    it('所有复杂图表schema应该有正确的JSON Schema元数据', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
        expect(schema.$id).toBeDefined();
        expect(schema.title).toBeDefined();
        expect(schema.description).toBeDefined();
        expect(schema.type).toBe('object');
      });
    });

    it('应该有唯一的schema ID', () => {
      const ids = [voronoiRawSchema.$id, sankeyRawSchema.$id, treemapRawSchema.$id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('schema标题应该反映图表类型', () => {
      expect(voronoiRawSchema.title).toContain('Voronoi');
      expect(sankeyRawSchema.title).toContain('Sankey');
      expect(treemapRawSchema.title).toContain('Treemap');
    });
  });

  describe('Common Schema References', () => {
    it('应该正确引用common schema定义', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const dataRef = schema.properties.data.$ref;
        expect(dataRef).toBe('commonChartDefinitions.json#/definitions/chartDataArray');
        
        const titleRef = schema.properties.props.properties.title.$ref;
        expect(titleRef).toBe('commonChartDefinitions.json#/definitions/titleConfig');
        
        const backgroundRef = schema.properties.props.properties.background.$ref;
        expect(backgroundRef).toBe('commonChartDefinitions.json#/definitions/backgroundConfig');
      });
    });

    it('应该有一致的引用格式', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const refs = JSON.stringify(schema).match(/"\$ref":\s*"[^"]+"/g) || [];
        refs.forEach(ref => {
          expect(ref).toMatch(/"\$ref":\s*"commonChartDefinitions\.json#\/definitions\/\w+"/);
        });
      });
    });
  });

  describe('Chart Type Configuration', () => {
    it('应该有正确的图表类型常量', () => {
      expect(voronoiRawSchema.properties.props.properties.type.const).toBe('voronoi');
      expect(sankeyRawSchema.properties.props.properties.type.const).toBe('sankey');
      expect(treemapRawSchema.properties.props.properties.type.const).toBe('single-layer-treemap');
    });

    it('应该有正确的管道配置', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(schema.properties.pipe.type).toBe('string');
        expect(schema.properties.pipe.default).toBe('key_value');
        expect(schema.properties.pipe.description).toContain('数据处理方式');
      });
    });
  });

  describe('Specialized Map Configuration', () => {
    it('维诺图应该有三列数据映射配置', () => {
      const mapConfig = voronoiRawSchema.properties.props.properties.map;
      expect(mapConfig.minItems).toBe(3);
      expect(mapConfig.maxItems).toBe(3);
      expect(mapConfig.items.properties.function.enum).toContain('typeCol');
      expect(mapConfig.items.properties.function.enum).toContain('objCol');
      expect(mapConfig.items.properties.function.enum).toContain('vCol');
      expect(mapConfig.items.properties.type.enum).toContain('voronoi');
    });

    it('桑基图应该有源-目标-值映射配置', () => {
      const mapConfig = sankeyRawSchema.properties.props.properties.map;
      expect(mapConfig.minItems).toBe(3);
      expect(mapConfig.maxItems).toBe(3);
      expect(mapConfig.items.properties.function.enum).toContain('sourceCol');
      expect(mapConfig.items.properties.function.enum).toContain('targetCol');
      expect(mapConfig.items.properties.function.enum).toContain('vCol');
      expect(mapConfig.items.properties.type.enum).toContain('sankey');
    });

    it('矩形树图应该有两列数据映射配置', () => {
      const mapConfig = treemapRawSchema.properties.props.properties.map;
      expect(mapConfig.minItems).toBe(2);
      expect(mapConfig.maxItems).toBe(2);
      expect(mapConfig.items.properties.type.enum).toContain('bar');
    });
  });

  describe('Fill Configuration', () => {
    it('应该有一致的填充控制选项', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const fillConfig = schema.properties.props.properties.fill;
        expect(fillConfig.properties.controlType.enum).toContain('single');
        expect(fillConfig.properties.controlType.enum).toContain('multiple');
        expect(fillConfig.properties.controlType.enum).toContain('gradient');
        expect(fillConfig.properties.controlType.default).toBe('multiple');
      });
    });

    it('应该有完整的阴影配置', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const shadowProps = schema.properties.props.properties.fill.properties.props.items.properties.shadow.properties;
        expect(shadowProps.show).toBeDefined();
        expect(shadowProps.type).toBeDefined();
        expect(shadowProps.angle).toBeDefined();
        expect(shadowProps.blur).toBeDefined();
        expect(shadowProps.color).toBeDefined();
        expect(shadowProps.radius).toBeDefined();
      });
    });

    it('矩形树图应该有边框配置', () => {
      const border = treemapRawSchema.properties.props.properties.fill.properties.props.items.properties.border;
      expect(border).toBeDefined();
      expect(border.properties.type).toBeDefined();
      expect(border.properties.width).toBeDefined();
      expect(border.properties.color).toBeDefined();
    });
  });

  describe('Specialized Display Configuration', () => {
    it('维诺图应该有完整的显示配置', () => {
      const voronoiDisplay = voronoiRawSchema.properties.props.properties.display.properties.voronoi.properties;
      expect(voronoiDisplay.drawShape).toBeDefined();
      expect(voronoiDisplay.drawStyle).toBeDefined();
      expect(voronoiDisplay.cornerRadius).toBeDefined();
      expect(voronoiDisplay.fillOpacity).toBeDefined();
      expect(voronoiDisplay.border).toBeDefined();
      
      // 检查绘制形状选项
      expect(voronoiDisplay.drawShape.enum).toContain('circle');
      expect(voronoiDisplay.drawShape.enum).toContain('hexagon');
      expect(voronoiDisplay.drawShape.enum).toContain('rectangle');
      expect(voronoiDisplay.drawShape.default).toBe('hexagon');
    });

    it('桑基图应该有节点和连线配置', () => {
      const sankeyDisplay = sankeyRawSchema.properties.props.properties.display.properties.sankey.properties;
      expect(sankeyDisplay.gapDistance).toBeDefined();
      expect(sankeyDisplay.fillOpacity).toBeDefined();
      expect(sankeyDisplay.nodeWidth).toBeDefined();
      expect(sankeyDisplay.color).toBeDefined();
      
      // 检查连线颜色选项
      expect(sankeyDisplay.color.oneOf).toBeDefined();
      expect(sankeyDisplay.color.oneOf.length).toBeGreaterThan(1);
    });

    it('矩形树图应该有矩形显示配置', () => {
      const treemapDisplay = treemapRawSchema.properties.props.properties.display.properties.bar.properties;
      expect(treemapDisplay.gapDistance).toBeDefined();
      expect(treemapDisplay.fillOpacity).toBeDefined();
      expect(treemapDisplay.border).toBeDefined();
      expect(treemapDisplay.border.properties.radius).toBeDefined();
    });
  });

  describe('Documentation Quality', () => {
    it('应该有描述信息', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(schema.description).toBeDefined();
        expect(schema.description.length).toBeGreaterThan(0);
        expect(schema.properties.pipe.description).toMatch(/[\u4e00-\u9fa5]/);
        expect(schema.properties.props.description).toMatch(/[\u4e00-\u9fa5]/);
      });
    });

    it('应该有合理的默认值', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(schema.properties.pipe.default).toBe('key_value');
        expect(schema.properties.props.properties.fill.properties.controlType.default).toBe('multiple');
      });
    });

    it('应该有中文描述的属性配置', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const mapDescription = schema.properties.props.properties.map.description;
        expect(mapDescription).toMatch(/[\u4e00-\u9fa5]/);
        
        const fillDescription = schema.properties.props.properties.fill.description;
        expect(fillDescription).toMatch(/[\u4e00-\u9fa5]/);
      });
    });
  });

  describe('Schema Constraints', () => {
    it('应该有适当的数值约束', () => {
      // 维诺图约束
      const voronoiProps = voronoiRawSchema.properties.props.properties.display.properties.voronoi.properties;
      expect(voronoiProps.cornerRadius.minimum).toBe(0);
      expect(voronoiProps.fillOpacity.minimum).toBe(0);
      expect(voronoiProps.fillOpacity.maximum).toBe(1);
      
      // 桑基图约束
      const sankeyProps = sankeyRawSchema.properties.props.properties.display.properties.sankey.properties;
      expect(sankeyProps.gapDistance.minimum).toBe(0);
      expect(sankeyProps.fillOpacity.minimum).toBe(0);
      expect(sankeyProps.fillOpacity.maximum).toBe(1);
      expect(sankeyProps.nodeWidth.minimum).toBe(1);
      
      // 矩形树图约束
      const treemapProps = treemapRawSchema.properties.props.properties.display.properties.bar.properties;
      expect(treemapProps.gapDistance.minimum).toBe(0);
      expect(treemapProps.fillOpacity.minimum).toBe(0);
      expect(treemapProps.fillOpacity.maximum).toBe(1);
    });

    it('应该有阴影配置约束', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const shadowProps = schema.properties.props.properties.fill.properties.props.items.properties.shadow.properties;
        expect(shadowProps.show.default).toBe(false);
        expect(typeof shadowProps.angle.default).toBe('number');
        expect(typeof shadowProps.blur.default).toBe('number');
        expect(typeof shadowProps.radius.default).toBe('number');
      });
    });
  });

  describe('Schema Completeness', () => {
    it('应该包含所有必要的根级属性', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.pipe).toBeDefined();
        expect(schema.properties.props).toBeDefined();
      });
    });

    it('props配置应该包含所有核心组件', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const props = schema.properties.props.properties;
        expect(props.type).toBeDefined();
        expect(props.title).toBeDefined();
        expect(props.background).toBeDefined();
        expect(props.map).toBeDefined();
        expect(props.fill).toBeDefined();
        expect(props.display).toBeDefined();
      });
    });

    it('所有必需字段应该正确配置', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const mapRequired = schema.properties.props.properties.map.items.required;
        expect(mapRequired).toContain('name');
        expect(mapRequired).toContain('index');
        expect(mapRequired).toContain('isLegend');
        expect(mapRequired).toContain('function');
        expect(mapRequired).toContain('configurable');
        expect(mapRequired).toContain('type');
      });
    });
  });

  describe('Advanced Schema Features', () => {
    it('应该支持复杂的数据类型', () => {
      // 桑基图的连线颜色支持多种类型
      const sankeyColor = sankeyRawSchema.properties.props.properties.display.properties.sankey.properties.color;
      expect(sankeyColor.oneOf).toBeDefined();
      
      // 矩形树图的边框半径支持多种类型
      const treemapRadius = treemapRawSchema.properties.props.properties.display.properties.bar.properties.border.properties.radius;
      expect(treemapRadius.oneOf).toBeDefined();
    });

    it('应该有合适的枚举值', () => {
      // 维诺图绘制模式
      const voronoiDrawStyle = voronoiRawSchema.properties.props.properties.display.properties.voronoi.properties.drawStyle;
      expect(voronoiDrawStyle.enum).toContain('auto');
      expect(voronoiDrawStyle.enum).toContain('fixed');
      
      // 阴影类型
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const shadowType = schema.properties.props.properties.fill.properties.props.items.properties.shadow.properties.type;
        expect(shadowType.enum).toContain('outer');
        expect(shadowType.enum).toContain('inner');
      });
    });
  });

  describe('Schema File Quality', () => {
    it('schema文件应该有合理的大小', () => {
      // 检查文件不是空的，也不会太大
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        const schemaString = JSON.stringify(schema);
        expect(schemaString.length).toBeGreaterThan(1000); // 至少1KB
        expect(schemaString.length).toBeLessThan(50000); // 不超过50KB
      });
    });

    it('应该有良好的JSON结构', () => {
      [voronoiRawSchema, sankeyRawSchema, treemapRawSchema].forEach(schema => {
        expect(() => JSON.stringify(schema)).not.toThrow();
        expect(schema).toEqual(JSON.parse(JSON.stringify(schema)));
      });
    });
  });
}); 