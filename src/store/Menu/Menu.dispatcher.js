import { CATEGORIES_STATIC_FILE_KEY } from "Component/Menu/Menu.config";
import { getStaticFile } from "Util/API/endpoint/StaticFiles/StaticFiles.endpoint";
import Logger from "Util/Logger";

import { setMenuCategories } from "./Menu.action";

export class MenuDispatcher {
  async requestCategories(gender, dispatch) {
    try {
      const categories = await getStaticFile(
        CATEGORIES_STATIC_FILE_KEY,
        typeof gender === "object"
          ? { $GENDER: gender.gender }
          : { $GENDER: gender }
      );

      dispatch(setMenuCategories(categories));
    } catch (e) {
      // TODO: handle error
      Logger.log(e);
      return { data: [] };
    }
  }
}

export default new MenuDispatcher();
