

const BlogSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 rounded-2xl bg-gray-200 p-4 shadow-md">
      {/* Image Skeleton */}
      <div className="h-40 w-full rounded-lg bg-gray-300"></div>

      {/* Title Skeleton */}
      <div className="h-6 w-3/4 rounded bg-gray-300"></div>

      {/* Likes & Comments Skeleton */}
      <div className="flex justify-between">
        <div className="h-5 w-16 rounded bg-gray-300"></div>
        <div className="h-5 w-16 rounded bg-gray-300"></div>
      </div>
    </div>
  );
};

export default BlogSkeleton;
