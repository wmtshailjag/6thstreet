// eslint-disable-next-line import/prefer-default-export
import { isArabic } from "Util/App";
export const groupByName = (brands = []) => {
    const numericGroup = '0-9';

    return brands.reduce((acc, brand) => {        
        const { name, name_ar } = brand;
        let firstLetter = "";
        if(isArabic()){
            firstLetter = !Number.isNaN(+name_ar[0]) ? numericGroup : name_ar[0].toUpperCase();
        }else{
            firstLetter = !Number.isNaN(+name[0]) ? numericGroup : name[0].toUpperCase();
        }

        

        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }

        acc[firstLetter].push(brand);
        return acc;
    }, {});
};
