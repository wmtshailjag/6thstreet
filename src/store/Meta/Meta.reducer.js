import {
    initialState as sourceInitialState,
    MetaReducer as sourceMetaReducer,
    updateEveryTime as sourceUpdateEveryTime,
    filterData as sourceFilterData
} from 'SourceStore/Meta/Meta.reducer';
import { UPDATE_META } from 'SourceStore/Meta/Meta.action';

export const updateEveryTime = [
    ...sourceUpdateEveryTime,
    'hreflangs',
    'twitter_title',
    'twitter_desc',
    'og_title',
    'og_desc'
];

export const initialState = {
    ...sourceInitialState,
    hreflangs: [],
    twitter_title: '',
    twitter_desc:'',
    og_title:'',
    og_desc:'',
};

export const MetaReducer = (
    state = initialState,
    action
) => sourceMetaReducer(state, action);


export default MetaReducer;
