import { useLocation, useNavigation } from "react-router";

type Collapse = (pathname: string) => string;
const identity: Collapse = (pathname) => pathname;

export function PageTransition({
  children,
  collapse = identity,
}: {
  children: React.ReactNode;
  collapse?: Collapse;
}) {
  const location = useLocation();
  const navigation = useNavigation();
  const key = collapse(location.pathname);
  const target = navigation.location
    ? collapse(navigation.location.pathname)
    : key;

  const leaving =
    navigation.state === "loading" && !navigation.formMethod && target !== key;

  return (
    <div key={key} data-leaving={leaving} className="page-transition">
      {children}
    </div>
  );
}
