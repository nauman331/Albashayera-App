import { useState, useEffect } from "react";
import { backendURL, categories } from "../utils/exports";

interface Category {
  key: string;
  name: string;
}

interface CategoryData {
  [key: string]: any;
}

const useFetchCarsAndCategories = () => {
  const [cars, setCars] = useState<Record<string, any>[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAllCars = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${backendURL}/car`);
      if (!response.ok) throw new Error("Failed to fetch cars");
      const res_data = await response.json();
      setCars(res_data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const results = await Promise.all(
        categories.map(async (category: Category) => {
          const res = await fetch(`${backendURL}/${category.key}`);
          if (!res.ok) throw new Error(`Failed to fetch category ${category.name}`);
          return { key: category.key, data: await res.json() };
        })
      );

      // Convert array to object { key: data }
      const formattedData: CategoryData = results.reduce((acc, item) => {
        acc[item.key] = item.data;
        return acc;
      }, {} as CategoryData);

      setCategoriesData(formattedData);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    getAllCars();
    fetchCategories();
  }, []);

  return { cars, categoriesData, loading, error };
};

export default useFetchCarsAndCategories;
