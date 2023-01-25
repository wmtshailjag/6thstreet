import CDN from '../../provider/CDN';
import MobileAPI from '../../provider/MobileAPI';
import { indexConfig } from './Config.format';

// eslint-disable-next-line import/prefer-default-export
export const getConfig = () => {
    const configFile = 'default.json';
    const directory = process.env.REACT_APP_REMOTE_CONFIG_DIR;
    return indexConfig(CDN.get(`${directory}/${configFile}`));
};

export const getSchema = (locale) => {
    const configFile = 'schema.json';
    const directory = process.env.REACT_APP_REMOTE_CONFIG_DIR;
    if(!!!locale){
        return CDN.get(`${directory}/seo/${configFile}`);
    }
    return CDN.get(`${directory}/seo/${locale}/${configFile}`);
};

export const getCities = () => MobileAPI.get(
    '/cities',
) || {};
