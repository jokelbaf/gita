import { useLocation, useNavigation } from "react-router";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigation = useNavigation();
  const leaving = navigation.state === "loading" && !navigation.formMethod;

  return (
    <div
      key={location.pathname}
      data-leaving={leaving}
      className="page-transition"
    >
      {children}
    </div>
  );
}
