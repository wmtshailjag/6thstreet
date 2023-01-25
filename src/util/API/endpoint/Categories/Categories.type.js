import PropTypes from 'prop-types';

export const Design = PropTypes.shape({
    background_color: PropTypes.string,
    text_color: PropTypes.string
});

export const CategoryButton = PropTypes.shape({
    design: Design,
    label: PropTypes.string,
    link: PropTypes.string,
    plp_title: PropTypes.string
});

export const CategoryItem = PropTypes.shape({
    image_url: PropTypes.string,
    label: PropTypes.string,
    link: PropTypes.string
});

export const CategoryItems = PropTypes.arrayOf(CategoryItem);

export const CategoryData = PropTypes.shape({
    type: PropTypes.string,
    button: CategoryButton,
    items: CategoryItems
});

export const CategorySliderItem = PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    items: CategoryItems
});

export const CategorySliderItems = PropTypes.arrayOf(CategorySliderItem);

export const Category = PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    design: Design,
    data: PropTypes.arrayOf(CategoryData)
});

export const Categories = PropTypes.arrayOf(Category);
