import { Field } from 'Util/Query';

/**
 * CmsPage Query
 * @class CmsPageQuery
 */
export class CmsPageQuery {
    getQuery({ id }) {
        return new Field('cmsPage')
            .addArgument('id', 'Int!', id)
            .addFieldList(
                [
                    'title',
                    'content',
                    'content_heading',
                    'meta_title'
                ]
            );
    }
}

export default new CmsPageQuery();
