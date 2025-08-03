import { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [navToggle, setNavToggle] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("React JS");

  return (
    <AppContext.Provider
      value={{
        navToggle,
        setNavToggle,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
