import {
  AvocadoIcon,
  HalalIcon,
  Kosher01Icon,
  VeganIcon,
  VegetarianFoodIcon,
} from "../../components/icons/icons";
const iconsClassName = `size-6 text-heavy`;

export const DIETARY_PREFERENCES = {
  vegan: {
    title: "Vegan",
    icon: <VeganIcon className={iconsClassName} />,
  },
  vegetarian: {
    title: "Vegetarian",
    icon: <VegetarianFoodIcon className={iconsClassName} />,
  },
  halal: {
    title: "Halal",
    icon: <HalalIcon className={iconsClassName} />,
  },
  kosher: {
    title: "Kosher",
    icon: <Kosher01Icon className={iconsClassName} />,
  },
  keto: {
    title: "Keto",
    icon: <AvocadoIcon className={iconsClassName} />,
  },
};
