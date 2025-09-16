import useFilterStore from "@/libs/store/filters-store";

const createFilterParams = () => {
  const {
    typeFilters,
    allergyFilters,
    dietFilters,
    caloryFilters,
    isCaloryChanged,
  } = useFilterStore.getState();
  const params: Record<string, string | number | boolean | undefined> = {};

  // Add type filters
  typeFilters.forEach((type) => {
    params[`itemType`] = type;
  });

  // Add allergy filters
  allergyFilters.forEach((allergy) => {
    params[`allergies.${allergy}`] = true;
  });

  // Add diet filters
  dietFilters.forEach((diet) => {
    params[`dietaryPreferences.${diet}`] = true;
  });

  // Add calory filter
  if (caloryFilters.length === 2 && isCaloryChanged) {
    params.caloriesKcalMin = caloryFilters[0] + "";
    params.caloriesKcalMax =
      caloryFilters[1] >= 1500 ? undefined : caloryFilters[1] + "";
  }

  return params;
};

export default createFilterParams;
