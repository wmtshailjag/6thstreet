import { SET_MENU_CATEGORIES } from './Menu.action';

export const getInitialState = () => ({
    isLoading: true,
    categories: []
});

export const MenuReducer = (state = getInitialState(), action) => {
    const { type, categories } = action;

    switch (type) {
    case SET_MENU_CATEGORIES:
        return {
            ...state,
            isLoading: false,
            categories
        };

    default:
        return state;
    }
};

export default MenuReducer;
