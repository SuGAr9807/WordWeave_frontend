import { useEffect, useState } from "react";
import BlogSkeleton from "../ui/BlogSkeleton";
import placeholder from "@/assets/abc.jpg";

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/blogs-list/"); 
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-4 text-2xl font-bold">Blogs</h2>

      {/* Skeletons when loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BlogSkeleton />
          <BlogSkeleton />
          <BlogSkeleton />
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.post_id} className="rounded-2xl bg-white p-4 shadow-md">
              <img
                src={blog.image_url || placeholder} // Add image URL from API
                alt="Blog Cover"
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg object-cover"
              />
              <h3 className="mt-2 text-lg font-bold">{blog.title}</h3>
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <p>👍 {blog.likes} Likes</p>
                <p>💬 {blog.comments} Comments</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No blogs available.</p>
      )}
    </div>
  );
};

export default BlogList;
