/**
 *  Lucide Icon Guide
 * ----------------------------------------
 * → Browse all icons: https://lucide.dev/icons/
 * → Copy the icon name exactly:  "Bell", "User", "Search"
 * → Usage Example:
 *      <Icon name="Search" size={18} />
 */

import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
import { LucideIconName } from "./lucideIcons";
import { forwardRef } from "react";

type LucideIconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface Props {
  name: LucideIconName;
  size?: number;
  color?: string;
  fill?: string;
}

const CommonIcon = forwardRef<SVGSVGElement, Props>(
  ({ name, size = 16, color = "currentColor", ...rest }, ref) => {
    const SelectedIcon = Icons[name] as LucideIconComponent;

    if (!SelectedIcon) return null;

    return <SelectedIcon ref={ref} size={size} color={color} {...rest} />;
  }
);

export default CommonIcon;
