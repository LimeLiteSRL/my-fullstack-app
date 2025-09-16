import React from "react";
import { TourProvider } from "@reactour/tour";

const TourProviderComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <TourProvider className="rounded-xl" styles={styles} steps={steps}>
      {children}
    </TourProvider>
  );
};

export default TourProviderComponent;

const steps = [
  {
    content: "Filter foods and restaurants based on your needs.",
    selector: "#filter-button",
  },
  {
    content: "You can select your location",
    selector: "#location",
  },
];

const styles = {
  badge: (base: any) => ({ ...base, background: "#4E56D3", boxShadow: "none" }),
  close: (base: any) => ({ ...base, top: "12px", right: "12px" }),
};
