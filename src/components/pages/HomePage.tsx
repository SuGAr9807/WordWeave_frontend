import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogSkeleton from "../ui/BlogSkeleton";
import placeholder from "@/assets/abc.jpg";

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tags
    const fetchTags = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/list-tags/");
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags([{ tag_id: null, name: "All" }, ...data]);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    // Fetch blogs based on the selected tag
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const url = selectedTag
          ? `http://127.0.0.1:8000/blogs-list/?tag_id=${selectedTag}`
          : "http://127.0.0.1:8000/blogs-list/";
        const response = await fetch(url);
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
  }, [selectedTag]);

  return (
    <div className="container mx-auto p-4">
      {/* Tags Filter */}
      <div className="sticky top-0 z-10 flex overflow-x-auto bg-white p-2 shadow-sm">
        {tags.map((tag) => (
          <button
            key={tag.tag_id}
            onClick={() => setSelectedTag(tag.tag_id)}
            className={`mr-2 rounded-full px-4 py-2 text-sm font-medium ${
              selectedTag === tag.tag_id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <h2 className="mb-4 mt-4 text-2xl font-bold">Blogs</h2>

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
            <div
              key={blog.post_id}
              onClick={() => navigate(`/blog/${blog.post_id}`)}
              className="cursor-pointer rounded-2xl bg-white p-4 shadow-md transition hover:shadow-lg"
            >
              <img
                src={blog.image_url || placeholder}
                alt="Blog Cover"
                className="h-40 w-full rounded-lg object-cover sm:h-48 md:h-56 lg:h-64"
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
