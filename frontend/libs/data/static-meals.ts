export interface StaticMeal {
  id: string;
  name: string;
  category: 'High protein' | 'Low Calories' | 'Low Carbs';
  restaurant: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodImage: string;
  restaurantLogo: string;
  price: number; // Price in cents
  description?: string;
}

export const staticMeals: StaticMeal[] = [
  {
    id: 'static-1',
    name: 'Miso Glazed Salmon',
    category: 'High protein',
    restaurant: 'Sweetgreen',
    calories: 930,
    protein: 35,
    carbs: 88,
    fat: 48,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/sg1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/sg.webp',
    price: 1599, // $15.99
    description: 'Fresh salmon with miso glaze served with seasonal vegetables'
  },
  {
    id: 'static-2',
    name: 'Brussel Hustle Salad',
    category: 'High protein',
    restaurant: 'Little Beet Table',
    calories: 970,
    protein: 45,
    carbs: 50,
    fat: 67,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/lbt1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/lbt.webp',
    price: 1699, // $16.99
    description: 'Roasted brussels sprouts with protein-rich toppings'
  },
  {
    id: 'static-3',
    name: 'Deluxe Sandwich W/ American',
    category: 'High protein',
    restaurant: 'Chick-fil-a',
    calories: 490,
    protein: 32,
    carbs: 43,
    fat: 22,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/cf1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/cf.webp',
    price: 899, // $8.99
    description: 'Classic deluxe chicken sandwich with American cheese'
  },
  {
    id: 'static-4',
    name: 'Chicken Fajitas',
    category: 'High protein',
    restaurant: 'Chili\'s',
    calories: 470,
    protein: 58,
    carbs: 22,
    fat: 18,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/ci1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/ci.webp',
    price: 1299, // $12.99
    description: 'Grilled chicken fajitas with peppers and onions'
  },
  {
    id: 'static-5',
    name: 'Crispy Chicken Poblano',
    category: 'Low Calories',
    restaurant: 'Just Salad',
    calories: 520,
    protein: 22,
    carbs: 51,
    fat: 27,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/js1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/js.webp',
    price: 1199, // $11.99
    description: 'Crispy chicken with poblano peppers and fresh greens'
  },
  {
    id: 'static-6',
    name: 'Sausage Mcmuffin With Egg',
    category: 'Low Calories',
    restaurant: 'McDonalds',
    calories: 480,
    protein: 20,
    carbs: 30,
    fat: 31,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/m1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/m.webp',
    price: 499, // $4.99
    description: 'Classic breakfast sandwich with sausage, egg, and cheese'
  },
  {
    id: 'static-7',
    name: 'Brownie',
    category: 'Low Calories',
    restaurant: 'Panera Bread',
    calories: 470,
    protein: 7,
    carbs: 69,
    fat: 18,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/p1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/p.webp',
    price: 399, // $3.99
    description: 'Rich chocolate brownie perfect for dessert'
  },
  {
    id: 'static-8',
    name: 'Double Chicken Avocado Salad',
    category: 'Low Calories',
    restaurant: 'El Pollo Loco',
    calories: 350,
    protein: 51,
    carbs: 12,
    fat: 12,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/ep1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/ep.webp',
    price: 1099, // $10.99
    description: 'Fresh salad with double chicken and avocado'
  },
  {
    id: 'static-9',
    name: 'Whole - Ranch Cobb Salad',
    category: 'Low Carbs',
    restaurant: 'Panera Bread',
    calories: 470,
    protein: 17,
    carbs: 18,
    fat: 37,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/p2.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/p.webp',
    price: 1099, // $10.99
    description: 'Classic cobb salad with ranch dressing and fresh ingredients'
  },
  {
    id: 'static-10',
    name: 'The Wedgieburger',
    category: 'Low Carbs',
    restaurant: 'Red Robin',
    calories: 500,
    protein: 32,
    carbs: 14,
    fat: 36,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/rr1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/rr.webp',
    price: 1399, // $13.99
    description: 'Burger wrapped in lettuce instead of a bun'
  },
  {
    id: 'static-11',
    name: 'Bowl - Turkey And Provolone',
    category: 'Low Carbs',
    restaurant: 'Jersey Mike\'s',
    calories: 494,
    protein: 30,
    carbs: 8,
    fat: 38,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/jm1.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/jm.webp',
    price: 999, // $9.99
    description: 'Turkey and provolone cheese in a bowl format'
  },
  {
    id: 'static-12',
    name: 'Hash Brown Scramble Bowl W/ Nuggets',
    category: 'Low Carbs',
    restaurant: 'Chick-fil-a',
    calories: 470,
    protein: 29,
    carbs: 19,
    fat: 30,
    foodImage: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/cf2.webp',
    restaurantLogo: 'https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/cf.webp',
    price: 799, // $7.99
    description: 'Scrambled eggs with hash browns and chicken nuggets'
  }
];

// Helper functions to get meals by category
export const getMealsByCategory = (category: 'High protein' | 'Low Calories' | 'Low Carbs'): StaticMeal[] => {
  return staticMeals.filter(meal => meal.category === category);
};

export const getHighProteinMeals = (): StaticMeal[] => {
  return getMealsByCategory('High protein');
};

export const getLowCalorieMeals = (): StaticMeal[] => {
  return getMealsByCategory('Low Calories');
};

export const getLowCarbMeals = (): StaticMeal[] => {
  return getMealsByCategory('Low Carbs');
};
