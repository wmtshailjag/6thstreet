import { showNotification } from "Store/Notification/Notification.action";
import { setWishlistItems } from "Store/Wishlist/Wishlist.action";
import MagentoAPI from "Util/API/provider/MagentoAPI";
import MobileAPI from "Util/API/provider/MobileAPI";
import { isSignedIn } from "Util/Auth";
import Algolia from "Util/API/provider/Algolia";

export class WishlistDispatcher {
  updateInitialWishlistData(dispatch) {
    // backwards compatibility
    this.syncWishlist(dispatch);
  }

  async syncWishlist(dispatch) {
    if (!isSignedIn()) {
      // skip non-authorized users
      dispatch(setWishlistItems([]));
      return;
    }

    try {
      const items2 = await MobileAPI.get(`/wishlist?new=1`);
      const {
        data: { product_ids },
      } = items2;

      if (product_ids) {
        let productIdsArr = [];
        product_ids.map((product, index) => {
          productIdsArr.push(product.product_id.toString());
        });
        const wishListData = await new Algolia().getWishlistProduct(
          productIdsArr
        );
        product_ids.map((product, index) => {
          product["product"] = wishListData.results[index];
        });
        dispatch(setWishlistItems(product_ids));
      } else {
        dispatch(setWishlistItems([]));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async removeSkuFromWishlist(id, dispatch) {
    if (!isSignedIn()) {
      // skip non-authorized users
      dispatch(
        showNotification(
          "info",
          __("You must be logged in to remove items to wishlist")
        )
      );

      return;
    }

    try {
      await MobileAPI.delete(`/wishlist/${id}?new=1`);

      this.updateInitialWishlistData(dispatch);

      dispatch(
        showNotification(
          "success",
          __("Product has been removed from your Wish List!")
        )
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      dispatch(
        showNotification("info", __("Failed to remove item from wishlist"))
      );
    }
  }

  async addSkuToWishlist(dispatch, sku) {
    if (!isSignedIn()) {
      // skip non-authorized users
      dispatch(
        showNotification(
          "info",
          __("You must be logged in to add items to wishlist")
        )
      );

      return;
    }

    try {
      const response = await MobileAPI.post(`/wishlist?new=1`, {
        sku: sku,
      });
      this.updateInitialWishlistData(dispatch);
      if (response.status === 200) {
        dispatch(
          showNotification("success", __("Product added to wish-list!"))
        );
      } else {
        dispatch(
          showNotification("info", __("Failed to add item to wishlist"))
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      dispatch(showNotification("info", __("Failed to add item to wishlist")));
    }
  }
}

export default new WishlistDispatcher();
