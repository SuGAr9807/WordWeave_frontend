import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Define the user data type based on your API response
interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  profile_picture: string;
  is_active: boolean;
  date_joined: string;
}

// Define the blog data structure
interface BlogPost {
  post_id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
}

const UserProfilePage: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [blogsLoading, setBlogsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blogsError, setBlogsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data by user_id from params
        const response = await axios.get(`http://127.0.0.1:8000/blogs-list/users/${user_id}/`);
        setUserData(response.data);
        setLoading(false);
        
        // Once we have the user data, fetch their blogs
        fetchUserBlogs(user_id);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
        console.error('Error fetching profile data:', err);
      }
    };

    const fetchUserBlogs = async (uid: string) => {
      setBlogsLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/blogs-list/${uid}/user-posts/`);
        setUserBlogs(response.data);
        setBlogsLoading(false);
      } catch (err) {
        setBlogsError('Failed to load blog posts. Please try again later.');
        setBlogsLoading(false);
        console.error('Error fetching user blogs:', err);
      }
    };

    if (user_id) {
      fetchUserData();
    } else {
      setError('User ID not found in URL.');
      setLoading(false);
    }
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">No user data found.</div>
      </div>
    );
  }

  // Format the date_joined to be more readable
  const formattedDate = new Date(userData.date_joined).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format blog date
  const formatBlogDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Profile Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{userData.name}'s Profile</h1>
        </div>
        
        <div className="flex flex-col md:flex-row p-6">
          <div className="flex justify-center md:w-1/3 mb-6 md:mb-0">
            {userData.profile_picture ? (
              <img 
                src={userData.profile_picture} 
                alt={`${userData.name}'s profile`} 
                className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="rounded-full w-32 h-32 bg-gray-300 flex items-center justify-center text-gray-500 text-2xl border-4 border-white shadow-lg">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">@{userData.username}</p>
            </div>
            
            <div className="space-y-4">
              {/* Email (only visible if appropriate for public view) */}
              <div className="border-b pb-3">
                <p className="text-gray-500 text-sm">Email</p>
                <p>{userData.email}</p>
              </div>
              
              {/* Other data points on one line */}
              <div className="flex flex-wrap">
                <div className="mr-6">
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p>{formattedDate}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className={userData.is_active ? "text-green-600" : "text-red-600"}>
                    {userData.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Blogs Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{userData.name}'s Blog Posts</h2>
        </div>
        
        <div className="p-6">
          {blogsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg">Loading blogs...</div>
            </div>
          ) : blogsError ? (
            <div className="text-red-500 py-4">{blogsError}</div>
          ) : userBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">This user hasn't written any blog posts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userBlogs.map((blog) => (
                <div key={blog.post_id} className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="md:flex">
                    {blog.image_url && (
                      <div className="md:w-1/4">
                        <img 
                          src={blog.image_url} 
                          alt={blog.title} 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-4 ${blog.image_url ? 'md:w-3/4' : 'w-full'}`}>
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                      <div 
                        className="text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: blog.content.length > 150 
                            ? blog.content.substring(0, 150) + '...' 
                            : blog.content 
                        }} 
                      />
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex space-x-4">
                          <span>👍 {blog.likes} Likes</span>
                          <span>💬 {blog.comments} Comments</span>
                          <span>📅 {formatBlogDate(blog.created_at)}</span>
                        </div>
                        <div>
                          <a 
                            href={`/blog/${blog.post_id}`}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-md text-sm"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;