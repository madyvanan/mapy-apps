import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  totalAmount: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD'; payload: { item: CartItem; restaurantId: string } }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { menuItemId: string; quantity: number } }
  | { type: 'CLEAR' };

const initialState: CartState = { items: [], restaurantId: null, totalAmount: 0, itemCount: 0 };

const calcTotals = (items: CartItem[]) => ({
  totalAmount: items.reduce((sum, i) => sum + i.subtotal, 0),
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD': {
      if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
        return state;
      }
      const existing = state.items.findIndex((i) => i.menuItemId === action.payload.item.menuItemId);
      let items: CartItem[];
      if (existing >= 0) {
        items = state.items.map((item, idx) =>
          idx === existing
            ? { ...item, quantity: item.quantity + action.payload.item.quantity, subtotal: item.subtotal + action.payload.item.subtotal }
            : item,
        );
      } else {
        items = [...state.items, action.payload.item];
      }
      return { items, restaurantId: action.payload.restaurantId, ...calcTotals(items) };
    }
    case 'REMOVE': {
      const items = state.items.filter((i) => i.menuItemId !== action.payload);
      return { ...state, items, ...(items.length === 0 ? { restaurantId: null } : {}), ...calcTotals(items) };
    }
    case 'UPDATE_QTY': {
      const items = state.items.map((i) => {
        if (i.menuItemId !== action.payload.menuItemId) return i;
        const unitPrice = i.subtotal / i.quantity;
        return { ...i, quantity: action.payload.quantity, subtotal: unitPrice * action.payload.quantity };
      });
      return { ...state, items, ...calcTotals(items) };
    }
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
};

interface CartContextValue extends CartState {
  addItem: (item: CartItem, restaurantId: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem, restaurantId: string) =>
    dispatch({ type: 'ADD', payload: { item, restaurantId } });
  const removeItem = (menuItemId: string) => dispatch({ type: 'REMOVE', payload: menuItemId });
  const updateQty = (menuItemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', payload: { menuItemId, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
