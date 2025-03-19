import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import placeholder from "@/assets/abc.jpg";

const TopBlogPages = () => {
  const [topLikedPosts, setTopLikedPosts] = useState<any[]>([]);
  const [topCommentedPosts, setTopCommentedPosts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Refs for horizontal scrolling
  const topLikedRef = useRef<HTMLDivElement>(null);
  const topCommentedRef = useRef<HTMLDivElement>(null);
  const topUsersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch top liked posts
        const likedResponse = await fetch("http://127.0.0.1:8000/blogs-list/top-liked-posts/");
        if (!likedResponse.ok) throw new Error("Failed to fetch top liked posts");
        const likedData = await likedResponse.json();
        setTopLikedPosts(likedData);

        // Fetch most commented posts
        const commentedResponse = await fetch("http://127.0.0.1:8000/blogs-list/most-commented-posts/");
        if (!commentedResponse.ok) throw new Error("Failed to fetch most commented posts");
        const commentedData = await commentedResponse.json();
        setTopCommentedPosts(commentedData);

        // Fetch top users
        const usersResponse = await fetch("http://127.0.0.1:8000/blogs-list/get-all-user/");
        if (!usersResponse.ok) throw new Error("Failed to fetch top users");
        const usersData = await usersResponse.json();
        console.log(usersData[0])
        setTopUsers(usersData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to scroll left
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll right
  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const BlogCard = ({ blog }: { blog: any }) => (
    <div
      onClick={() => navigate(`/blog/${blog.post_id}`)}
      className="flex-shrink-0 w-64 md:w-72 bg-white rounded-2xl shadow-md p-4 m-2 cursor-pointer transition hover:shadow-lg"
    >
      <img
        src={blog.image_url || placeholder}
        alt="Blog Cover"
        className="w-full h-40 rounded-lg object-cover"
      />
      <h3 className="mt-2 text-lg font-bold truncate">{blog.title}</h3>
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <p>👍 {blog.likes} Likes</p>
        <p>💬 {blog.comments} Comments</p>
      </div>
    </div>
  );

  const UserCard = ({ user }: { user: any }) => (
    <div
      onClick={() => navigate(`/user/${user.user_id}`)}
      className="flex-shrink-0 w-56 bg-white rounded-2xl shadow-md p-4 m-2 cursor-pointer transition hover:shadow-lg"
    >
      <div className="flex flex-col items-center">
        <img
          src={user.profile_picture || placeholder}
          alt={user.username}
          className="w-20 h-20 rounded-full object-cover"
        />
        <h3 className="mt-2 text-lg font-bold">{user.username}</h3>
        <p className="text-gray-600">Total Likes: {user.total_likes}</p>
        <p className="text-gray-600">Posts: {user.posts_count}</p>
      </div>
    </div>
  );

  const SectionSkeleton = () => (
    <div className="flex overflow-hidden space-x-4 pb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-shrink-0 w-64 h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
      ))}
    </div>
  );

  // Component for a section with side arrows
  const ScrollableSection = ({ 
    title, 
    contentRef, 
    loading, 
    items, 
    renderItem, 
    emptyMessage = "No items available." 
  }: { 
    title: string, 
    contentRef: React.RefObject<HTMLDivElement>, 
    loading: boolean, 
    items: any[], 
    renderItem: (item: any) => JSX.Element, 
    emptyMessage?: string 
  }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {loading ? (
        <SectionSkeleton />
      ) : (
        <div className="relative">
          {items.length > 0 && (
            <button 
              onClick={() => scrollLeft(contentRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md"
              aria-label="Scroll left"
            >
              <span className="text-2xl font-bold">←</span>
            </button>
          )}
          
          <div 
            className="flex overflow-x-auto hide-scrollbar py-2 px-10" 
            ref={contentRef}
          >
            {items.length > 0 ? (
              items.map((item) => renderItem(item))
            ) : (
              <p className="text-gray-500">{emptyMessage}</p>
            )}
          </div>
          
          {items.length > 0 && (
            <button 
              onClick={() => scrollRight(contentRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md"
              aria-label="Scroll right"
            >
              <span className="text-2xl font-bold">→</span>
            </button>
          )}
        </div>
      )}
    </section>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Blog Dashboard</h1>
      
      {/* Top Liked Posts */}
      <ScrollableSection 
        title="Top Liked Posts"
        contentRef={topLikedRef}
        loading={loading}
        items={topLikedPosts}
        renderItem={(blog) => <BlogCard key={blog.post_id} blog={blog} />}
        emptyMessage="No posts available."
      />
      
      {/* Most Commented Posts */}
      <ScrollableSection 
        title="Most Commented Posts"
        contentRef={topCommentedRef}
        loading={loading}
        items={topCommentedPosts}
        renderItem={(blog) => <BlogCard key={blog.post_id} blog={blog} />}
        emptyMessage="No posts available."
      />
      
      {/* Top Users */}
      <ScrollableSection 
        title="Top Contributors"
        contentRef={topUsersRef}
        loading={loading}
        items={topUsers}
        renderItem={(user) => <UserCard key={user.user_id} user={user} />}
        emptyMessage="No users available."
      />

      {/* CSS for hiding scrollbars but keeping functionality */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;  /* Firefox */
          -ms-overflow-style: none;  /* Internet Explorer and Edge */
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, and Opera */
        }
      `}</style>
    </div>
  );
};

export default TopBlogPages;