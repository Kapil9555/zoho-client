import {
  useAddItemToBasketMutation,
  useRemoveItemFromBasketMutation,
  useUpdateItemQtyMutation,
} from '@/redux/features/api/basketApi';
import { showError, showSuccess } from '@/utils/customAlert';
import { useSelector } from 'react-redux';

export const useBasketActions = () => {
  const { selectedBasketId } = useSelector((state) => state.basket);
  const { userInfo } = useSelector((state) => state.auth);

  const [addItemToBasket] = useAddItemToBasketMutation();
  const [updateItemQty] = useUpdateItemQtyMutation();
  const [removeItemFromBasket] = useRemoveItemFromBasketMutation();

  const ensureReady = () => {
    if (!userInfo) {
      showError('You must be logged in.');
      return false;
    }
    if (!selectedBasketId) {
      showError('No basket selected.');
      return false;
    }
    return true;
  };

  const addItem = async (productId, qty = 1, priceAtTime) => {
    if (!ensureReady()) return;
    try {
      await addItemToBasket({
        basketId: selectedBasketId,
        product: { productId, qty, priceAtTime },
      });
      showSuccess('Item added to basket!');
    } catch (err) {
      console.error(err);
      showError('Failed to add item.');
    }
  };

  const updateQty = async (itemId, qty) => {
    if (!ensureReady()) return;
    try {
      await updateItemQty({
        basketId: selectedBasketId,
        itemId,
        qty,
      });
      // showSuccess('Quantity updated!');
    } catch (err) {
      console.error(err);
      showError('Failed to update quantity.');
    }
  };

  const removeItem = async (itemId) => {
    if (!ensureReady()) return;
    try {
      await removeItemFromBasket({
        basketId: selectedBasketId,
        itemId,
      });
      // showSuccess('Item removed!');
    } catch (err) {
      console.error(err);
      showError('Failed to remove item.');
    }
  };

  return {
    addItem,
    updateQty,
    removeItem,
    basketId: selectedBasketId,
  };
};
