import { setBrandCMSData, setBrandCMSLoading } from "./BrandCms.action";

import { HOME_STATIC_FILE_KEY } from "Route/HomePage/HomePage.config";
import { getStaticFile } from "Util/API/endpoint/StaticFiles/StaticFiles.endpoint";
import isMobile from "Util/Mobile";

export class BrandCmsDispatcher {
  async requestBrandCms(dispatch) {
    dispatch(setBrandCMSLoading(true));

    try {
     
      const devicePrefix = isMobile.any() ? "m/" : "d/";
      const response = await getStaticFile(HOME_STATIC_FILE_KEY, {
        $FILE_NAME: `${devicePrefix}store_page.json`,
      });

      dispatch(setBrandCMSLoading(false));

      dispatch(setBrandCMSData(response));
    } catch (e) {
      Logger.log(e);
      dispatch(setBrandCMSLoading(false));
    }
  }
}
export default new BrandCmsDispatcher();
