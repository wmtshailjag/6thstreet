import { UrlRewritesQuery as SourceUrlRewritesQuery } from 'SourceQuery/UrlRewrites.query';
import { Field } from 'Util/Query';

/**
 * UrlRewrites Query
 * @class UrlRewritesQuery
 */
export class UrlRewritesQuery extends SourceUrlRewritesQuery {

    getDataField() {
        return new Field('data')
            .addFieldList(this.getDataFields());
    }

    getDataFields() {
        return [
            'path',
            'indexName',
            'url',
            'brand_name',
            'gender',
            'heel_height',
            'color',
            'sku',
            'sole',
            'toe_shape',
            'upper_material',
            'url_key',
            'meta_title',
            'meta_keyword',
            'meta_description',
            'brand_text',
            'brand_html',
            'brand_logo',
            'beauty_color',
            'beauty_size',
            'coller_type',
            'color_family',
            'colorfamily',
            'country_of_manufacture',
            'custom_design',
            'custom_layout',
            'detail',
            'dress_length',
            'fit',
            'heel_shape',
            'launch_week',
            'leg_length',
            'manufacturer',
            'material',
            'material_clothing',
            'mc_color',
            'neck_line',
            'occasion',
            'padded',
            'page_layout',
            'price_view',
            'product_category',
            'product_type_6s',
            'rise',
            'season',
            'size_uk',
            'size_eu',
            'size_us',
            'skirt_length',
            'sleeve_length',
            'wired',
            this.getNumericFiltersField()
        ];
    }

    getNumericFiltersField() {
        return new Field('numericFilters')
            .addFieldList(this.getNumericFiltersFields());
    }

    getNumericFiltersFields() {
        return [
            'discount'
        ];
    }

    _getUrlResolverFields() {
        return [
            'type',
            'id',
            this.getDataField()
        ];
    }
}

export default new UrlRewritesQuery();
