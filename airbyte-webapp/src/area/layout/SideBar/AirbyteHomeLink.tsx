import React from "react";
import { useIntl } from "react-intl";

import { BrandingBadge, useGetProductBranding } from "components/ui/BrandingBadge";
import { Link } from "components/ui/Link";

import { RoutePaths } from "pages/routePaths";

import styles from "./AirbyteHomeLink.module.scss";

export const AirbyteHomeLink: React.FC = () => {
  const { formatMessage } = useIntl();
  const product = useGetProductBranding();

  return (
    <div className={styles.homeLink}>
      <Link
        to={RoutePaths.Connections}
        aria-label={formatMessage({ id: "sidebar.homepage" })}
        className={styles.homeLink__link}
      >
        <img src="/logo_ailiv.png" alt="Ailiv" className={styles.homeLink__logo} />
      </Link>
      <BrandingBadge product={product} testId={`${product}-badge`} />
    </div>
  );
};
