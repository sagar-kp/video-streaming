import { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [navToggle, setNavToggle] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("React JS");

  const memoizedValue = useMemo(() => {
    return { navToggle, setNavToggle, selectedCategory, setSelectedCategory };
  }, [navToggle, selectedCategory]);

  return (
    <AppContext.Provider value={memoizedValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

AppProvider.propTypes = {
  children: PropTypes.node,
};
