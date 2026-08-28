import { SkeletonType, CommonSkeletonProps } from "./types";
import { skeletonMap } from "./skeletonMap";

const CommonSkeleton = ({
  type = "text",
  ...props
}: { type?: SkeletonType } & CommonSkeletonProps) => {
  const Component = skeletonMap[type];
  return Component ? <Component {...props} /> : null;
};

export default CommonSkeleton;
